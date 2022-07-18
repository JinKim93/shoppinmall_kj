import React, { useState } from "react";
import { Collapse, Radio } from "antd";

const { Panel } = Collapse;
function RadioBox(props) {
  //체크박스 하나 클릭하면 하나만 선택하게 해줌
  const [Value, setValue] = useState(0);
  const renderRadioBox = () =>
    props.list &&
    props.list.map((value) => (
      <Radio key={value._id} value={value._id}>
        {value.name}
      </Radio>
    ));
  //체크박스 하나 클릭하면 하나만 선택하게 해줌
  const handleChange = (event) => {
    setValue(event.target.value);
    //부모컴포넌트에 업데이트 해줌
    props.handleFilters(event.target.value)
  };
  return (
    <div>
      <Collapse defaultActiveKey={["0"]}>
        <Panel header="Price" key="1">
          <Radio.Group onChange={handleChange} value={Value}>
            {renderRadioBox()}
          </Radio.Group>
        </Panel>
      </Collapse>
    </div>
  );
}

export default RadioBox;
