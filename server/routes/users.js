const express = require("express");
const router = express.Router();
const { User } = require("../models/User");

const { auth } = require("../middleware/auth");
const { Product } = require("../models/Product");
const { Payment } = require("../models/Payment");
const async = require("async");

//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
    cart: req.user.cart,
    //결제내역 history
    history: req.user.history,
  });
});

router.post("/register", (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found",
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password" });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie("w_authExp", user.tokenExp);
        res.cookie("w_auth", user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});

router.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { token: "", tokenExp: "" },
    (err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

router.post("/addToCart", auth, (req, res) => {
  //먼저 User Collection에 해당 유저의 정보를 가져오기

  User.findOne({ _id: req.user._id }, (err, userInfo) => {
    //가져온 정보에서 카트에다 넣으려 하는 상품이 이미 들어 있는지 확인
    let duplicate = false; //상품 없을경우
    userInfo.cart.forEach((item) => {
      if (item.id === req.body.productId) {
        duplicate = true; //상품들어있는경우
      }
    });
    //상품이 이미 있을때 -> 상품개수만 올린다
    if (duplicate) {
      User.findOneAndUpdate(
        { _id: req.user.id, "cart.id": req.body.productId },
        //inc로 user테이블 quantity을 1 증가해줌
        { $inc: { "cart.$.quantity": 1 } },
        //업데이트된 userInfo을 받을려면 new: true가 필요함
        { new: true },
        (err, userInfo) => {
          if (err) return res.status(200).json({ success: false, err });
          res.status(200).send(userInfo.cart);
        }
      );
    }
    //상품이 이미 있지 않을때
    else {
      User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $push: {
            cart: {
              id: req.body.productId,
              quantity: 1,
              date: Date.now(),
            },
          },
        },
        //update시켰으니까 new : true해준다
        { new: true },
        (err, userInfo) => {
          if (err) return res.status(400).json({ success: false, err });
          res.status(200).send(userInfo.cart);
        }
      );
    }
  });
});

//cart에 있는 내용 삭제 router
router.get("/removeFromCart", auth, (req, res) => {
  //먼저 cart안에 내가 지우려고 한 상품을 지워주기
  User.findOneAndUpdate(
    //하기 처럼 쓸수있는 이유는 auth미들웨어 때문이다
    { _id: req.user._id },
    {
      //지울때는 pull을 이용함
      //넣을때는 push
      $pull: { cart: { id: req.query.id } },
    },
    //update된 값을 가지기위한 코드
    { new: true },
    (err, userInfo) => {
      //routes/product.js에서 상품가져오기랑 같은 부분이다
      let cart = userInfo.cart;
      let array = cart.map((item) => {
        return item.id;
      });

      //product collection에서 현재 남아있는 상품들의 정보를 가져오기
      Product.find({ _id: { $in: array } })
        .populate("writer")
        .exec((err, productInfo) => {
          return res.status(200).json({
            productInfo,
            cart,
          });
        });
    }
  );
});
//미들웨어 통해서 오는 정보들
// ex) req.user._id 등
router.post("/successBuy", auth, (req, res) => {
  // 1. User Collection 안에 History 필드 안에 간단한 결제 정보 넣어주기
  let history = [];
  let transactionData = {};
  req.body.cartDetail.forEach((item) => {
    history.push({
      dataOfPurchase: Date.now(),
      name: item.title,
      id: item._id,
      price: item.price,
      quantity: item.quantity,
      //Cartpage.js에서 paymentData로 가지고와야함
      paymentId: req.body.paymentData.paymentID,
    });
  });
  // 2. Payment Collection 안에 자세한 결제 정보들 넣어주기
  transactionData.user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  };

  transactionData.data = req.body.paymentData;
  transactionData.product = history;

  //history 정보 저장
  User.findOneAndUpdate(
    { _id: req.user._id },
    //변화줄려면 $set -> cart정보 -> 결제성공 시 cart 내용 지우기
    { $push: { history: history }, $set: { cart: [] } },
    //업데이트시 새로운 document 받을수 있게 설정
    { new: true },
    (err, user) => {
      if (err) return res.json({ success: false, err });

      //payment에다가 transactionData 정보 저장
      const payment = new Payment(transactionData);
      payment.save((err, doc) => {
        if (err) return res.json({ success: false, err });

        // 3. Product Collection 안에 있는 sold 필드 정보 업데이트 시켜주기
        // 3. async npm 다운해야함
        // 3. 상품 당 몇개의 quantity를 샀는지
        let products = [];
        doc.product.forEach((item) => {
          products.push({ id: item.id, quantity: item.quantity });
        });

        async.eachSeries(
          products,
          (item, callback) => {
            Product.update(
              { _id: item.id },
              {
                $inc: {
                  sold: item.quantity,
                },
              },
              { new: false },
              callback
            );
          },
          (err) => {
            if (err) return res.status(400).json({ success: false, err });
            res.status(200).json({
              success: true,
              cart: user.cart,
              cartDetail: [],
            });
          }
        );
      });
    }
  );
});

module.exports = router;
