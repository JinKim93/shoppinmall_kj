import React, { useState } from "react";
import { Typography, Button, Form, Input } from "antd";
import FileUpload from "../../utils/FileUpload";
import Axios from "axios";

const { TextArea } = Input;

const Continents = [
  { key: 1, value: "Africa" },
  { key: 2, value: "Europe" },
  { key: 3, value: "Asia" },
  { key: 4, value: "North America" },
  { key: 5, value: "South America" },
  { key: 6, value: "Australia" },
  { key: 7, value: "Antarctica" },
];

function UploadProductPage(props) {
  const [Title, setTitle] = useState("");
  const [Description, setDescription] = useState("");
  const [Price, setPrice] = useState(0);
  const [Continent, setContinent] = useState(1);
  const [Images, setImages] = useState([]);

  const titleChangeHandler = (event) => {
    setTitle(event.currentTarget.value);
  };

  const descriptionChangeHandler = (event) => {
    setDescription(event.currentTarget.value);
  };

  const priceChangeHandler = (event) => {
    setPrice(event.currentTarget.value);
  };

  const continentChangeHandler = (event) => {
    setContinent(event.currentTarget.value);
  };

  const updateImages = (newImages) => {
    setImages(newImages);
  };

  const submitHandler = (event) => {
    //버튼 누를때, refresh 안되게함
    event.preventDefault();

    //모든 칸 채워지지 않으면 확인버튼 눌러도 안되게 조건문 주기
    if (!Title || !Description || !Price || !Continent || !Images) {
      return alert("모든 값을 넣으세요");
    }

    //서버에 채운 값들을 request로 보낸다
    //post로 보내니까 body가 있어야한다

    const body = {
      //로그인 된 사람의 id
      //hoc auth.js에서 props를 이용해 user정보 넣기
      writer: props.user.userData._id,
      title: Title,
      description: Description,
      price: Price,
      images: Images,
      continents: Continent,
    };
    //body의 모든 정보  백엔드로 보낸다
    //then -> 백엔드에서 처리한 이후, 결과값 response에 넣어줌
    Axios.post("/api/product", body).then((response) => {
      //백엔드에서 정상적으로 처리 잘했으면

      if (response.data.success) {
        alert("상품 업로드 성공");
        //상품 올린 후 props를 이용해서, 랜딩페이지로 이동하게 해줌
        props.history.push("/");
      } else {
        alert("상품 업로드 실패");
      }
    });
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2>레고상품업로드</h2>
      </div>

      <Form onSubmit={submitHandler}>
        {/*Drop zone*/}

        <FileUpload refreshFunction={updateImages} />

        <br />
        <br />
        <label>이름</label>
        <Input onChange={titleChangeHandler} value={Title} />
        <br />
        <br />
        <label>설명</label>
        <TextArea onChange={descriptionChangeHandler} value={Description} />
        <br />
        <br />
        <label>가격($)</label>
        <Input type="number" onChange={priceChangeHandler} value={Price} />
        <br />
        <br />
        <select onChange={continentChangeHandler} value={Continent}>
          {Continents.map((item) => (
            <option key={item.key} value={item.key}>
              {item.value}
            </option>
          ))}
        </select>
        <br />
        <br />
        <button type={"submit"}>확인</button>
      </Form>
    </div>
  );
}

export default UploadProductPage;
