import React, { useEffect, useState } from "react";
import { FaCode } from "react-icons/fa";
import axios from "axios";
import { Icon, Col, Card, Row, Carousel } from "antd";
import Meta from "antd/lib/card/Meta";
//가져오기
import ImageSlider from "../../utils/ImageSlider";
import CheckBox from "./Sections/CheckBox";
import RadioBox from "./Sections/RadioBox";
import SearchFeature from "./Sections/SearchFeature";
//Data.js파일에서 리스트 만든거 import
import { continents, price } from "./Sections/Datas";

function LandingPage() {
  const [Products, setProducts] = useState([]);
  const [Skip, setSkip] = useState(0);
  //첫화면에 상품이미지 나오는 개수 설정
  const [Limit, setLimit] = useState(8);
  //더보기 버튼 눌렀을때 상품이 없을경우 안나오게 조건 설정
  const [PostSize, setPostSize] = useState(0);

  const [Filters, setFilters] = useState({
    continents: [],
    price: [],
  });

  const [SearchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let body = {
      skip: Skip,
      limit: Limit,
    };

    //서버로 요청보내는 함수
    getProducts(body);
  }, []);

  //DB에 있는 상품들 들고옴
  //body로 request보낼떄 같이보냄
  const getProducts = (body) => {
    axios.post("/api/product/products", body).then((response) => {
      if (response.data.success) {
        if (body.loadMore) {
          setProducts([...Products, ...response.data.productInfo]);
        } else {
          setProducts(response.data.productInfo);
        }
        //더보기 버튼 나오게 버튼활성화
        setPostSize(response.data.postSize);
        //console.log(response.data);
      } else {
        alert("상품가져오기 실패");
      }
    });
  };

  const loadMoreHandler = () => {
    let skip = Skip + Limit;

    let body = {
      skip: skip,
      limit: Limit,
      loadMore: true,
    };
    getProducts(body);
    setSkip(skip);
  };

  const renderCards = Products.map((product, index) => {
    //console.log("product", product);

    return (
      <Col lg={6} md={8} xs={24} key={index}>
        <Card
          cover={
            <a href={`/product/${product._id}`}>
              <ImageSlider images={product.images} />
            </a>
          }
        >
          <Meta title={product.title} description={`$${product.price}`} />
        </Card>
      </Col>
    );
  });

  const showFilteredResults = (filters) => {
    let body = {
      skip: 0,
      limit: Limit,
      filters: filters,
    };
    getProducts(body);
    setSkip(0);
  };

  //가격필터 관련함수 (priceValues)
  const handlePrice = (value) => {
    const data = price;
    let array = [];
    for (let key in data) {
      if (data[key]._id === parseInt(value, 10)) {
        array = data[key].array;
      }
    }
    return array;
  };

  //필터관련, 자식에서 부모컴포넌트로 전달해주기위해 만든함수
  const handleFilters = (filters, category) => {
    const newFilters = { ...Filters };

    newFilters[category] = filters;

    //console.log('filters',filters)

    if (category === "price") {
      let priceValues = handlePrice(filters);
      //priceValues가 Any가될수도 있고, 0 ~ 199도 될수도있다
      newFilters[category] = priceValues;
    }

    showFilteredResults(newFilters);
    setFilters(newFilters);
  };

  //검색한결과에서도 getproduct를이용해야함
  //상품전체를 가져오는 함수 getproduct함수
  const updateSearchTerm = (newSearchTerm) => {
    let body = {
      skip: 0,
      limit: Limit,
      filters: Filters,
      searchTerm: newSearchTerm,
    };

    setSkip(0);
    setSearchTerm(newSearchTerm);
    getProducts(body);
  };

  return (
    <div style={{ width: "75%", margin: "3rem auto" }}>
      <div style={{ textAlign: "center" }}>
        <h2>
          LOL 쇼핑몰 <Icon type="rocket" />
        </h2>
      </div>

      {/*Filter(체크박스필터 -> Sections폴더) -> Data.js에리스트 넣어줌*/}

      <Row gutter={[16, 16]}>
        <Col lg={12} xs={24}>
          {/*CheckBox */}
          <CheckBox
            list={continents}
            handleFilters={(filters) => handleFilters(filters, "continents")}
          />
        </Col>
        <Col lg={12} xs={24}>
          {/*RadioBox(가격필터)->Sections폴더) -> Data.js에리스트 넣어줌*/}
          <RadioBox
            list={price}
            handleFilters={(filters) => handleFilters(filters, "price")}
          />
        </Col>
      </Row>

      {/*Search*/}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "1rem auto",
        }}
      >
        <SearchFeature refreshFunction={updateSearchTerm} />
      </div>

      {/*Cards*/}

      <Row gutter={[16, 16]}>{renderCards}</Row>

      <br />

      {PostSize >= Limit && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={loadMoreHandler}>더보기</button>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
