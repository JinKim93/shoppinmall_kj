import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getCartItems,
  removeCartItem,
  onSuccessBuy,
} from "../../../_actions/user_actions";
import UserCardBlock from "./Sections/UserCardBlock";
import { Empty, Result } from "antd";
import Paypal from "../../utils/Paypal";
function CartPage(props) {
  const dispatch = useDispatch();
  //Total state -> 가격
  const [Total, setTotal] = useState(0);
  //cart에 있는거 다 지웟을대, 가격표시랑, 상품없다고 표시하는 state
  //ShowTotal이 true일때만 가격을 보여줄거다
  const [ShowTotal, setShowTotal] = useState(false);
  //구매완료 후 에만 success 나오게 해주는 state
  const [ShowSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let cartItems = [];
    //리덕스 User state안에 cart안에 상품이 들어있는지 확인
    if (props.user.userData && props.user.userData.cart) {
      if (props.user.userData.cart.length > 0) {
        props.user.userData.cart.forEach((item) => {
          cartItems.push(item.id);
        });
        dispatch(getCartItems(cartItems, props.user.userData.cart)).then(
          (response) => {
            calculateTotal(response.payload);
          }
        );
      }
    }
  }, [props.user.userData]);
  //장바구니 총합 구하는 함수
  const calculateTotal = (cartDetail) => {
    let total = 0;
    cartDetail.map((item) => {
      total += parseInt(item.price, 10) * item.quantity;
    });
    setTotal(total);
    //총합 구하고 나서 ShowTotal true
    setShowTotal(true);
  };
  //상품 지우기 함수
  const removeFromCart = (productId) => {
    dispatch(removeCartItem(productId)).then((response) => {
      if (response.payload.productInfo.length <= 0) {
        setShowTotal(false);
      }
    });
  };
  //결제 성공이후 처리 함수
  const transactionSuccess = (data) => {
    dispatch(
      onSuccessBuy({
        paymentData: data,
        cartDetail: props.user.cartDetail,
      })
    ).then((response) => {
      if (response.payload.success) {
        setShowTotal(false);
        setShowSuccess(true)
      }
    });
  };

  return (
    <div style={{ width: "85%", margin: "3rem auto" }}>
      <h1>My Cart</h1>
      <div>
        <UserCardBlock
          products={props.user.cartDetail}
          removeItem={removeFromCart}
        />
      </div>

      {ShowTotal ? (
        <div style={{ marginTop: "3rem" }}>
          <h2>Total Amount: ${Total}</h2>
        </div>
      ) : ShowSuccess ? (
        <Result status="success" title="Successfully Purchased Items" />
      ) : (
        <>
          <br />
          <Empty description={false} />
        </>
      )}

      {/* 상품이 없을경우 paypal버튼 안보이게 해주기 ShowTotal && 있을때 paypal버튼 보여주기*/}
      {/* 결제 이후 ,장바구니 비우기, 결제정보 저장하기 */}
      {/* 카트페이지, 부모컴포넌트에서 처리를 할거다 */}
      {ShowTotal && <Paypal total={Total} onSuccess={transactionSuccess} />}
    </div>
  );
}

export default CartPage;
