const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = mongoose.Schema(
  {
    writer: {
      type: Schema.Types.ObjectId,
      //참조할 스키마
      ref: "User",
    },
    title: {
      type: String,
      maxlength: 50,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
      default: [],
    },
    //현재까지몇개팔린정보
    sold: {
      type: Number,
      maxlength: 100,
      default: 0,
    },
    continents: {
      type: Number,
      default: 1
    },
    //사람들이 얼마나 봤는지 정보
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } //자동으로 등록시간, 업데이트시간 등록됨
);

//title이라는 키워드가 검색할때, 잘걸리게 해주기
//또는 description부분도 검색할때, 걸리게 해주기
productSchema.index({
  title:'text',
  description: 'text'
}, {
    weights:{
      //타이틀의 중요도5로봐서, 검색할때 -> 검색잘오게하기위한 중요도
      title:5,
      description:1
    } 
})

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };
