import axios from "axios";


export async function requestData(baseURL, queryParams, header) {
    
  let data = await axios.get(baseURL + queryParams);  // 데이터를 변경하지 않음으로 get이 맞지 않나??

    return data;
}