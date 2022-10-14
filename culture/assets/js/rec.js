// 로딩창 띄워줌
document.querySelector("#loading").classList.add("active");

/** form에서 유저가 선택했던 데이터를 가져옴 */
const date = window.localStorage.getItem("date"); // 날짜
const lat = window.localStorage.getItem("lat"); // 위도
const lon = window.localStorage.getItem("lon"); // 경도
const add = window.localStorage.getItem("add"); // 위치
const type = window.localStorage.getItem("type"); // 문화종류
console.log(date); // 일자
console.log(lat); // 위도
console.log(lon); // 경도
console.log(add); // 주소
console.log(type); // 장르

/** 어떤 키워드로 검색중인지 알려주는 텍스트 */
const h2 = document.createElement("h2");
const span1 = document.querySelector(".span1");
span1.innerHTML = date ? date : "";
const span2 = document.querySelector(".span2");
span2.innerHTML = add ? add + " 근처의" : "";
const span4 = document.querySelector(".span4");
span4.innerHTML = type ? type + "(을)를 찾을게요." : "";

setTimeout(() => {
  document.querySelector("#title2").style.opacity = "1";
}, 2000);

// 검색 결과의 수
let count = 1;
// 원하는 결과의 수
let currentImg = 10;
// 검색한 API의 page
let currentPage = 1;

// 검색 실행
search();

// 무한 스크롤
// window.addEventListener("scroll", (e) => {
//   const scrollTop = window.scrollY;

//   const widowHeight = window.screen.availHeight;

//   const documentHeight = document.body.scrollHeight;

//   const title2 = document.querySelector("#title2");

//   if (scrollTop + widowHeight >= documentHeight) {
//     // currentPage++;
//     currentImg += 30;
//     // 서버가 불안정하여 json데이터를 파일로 받아와 실행중인데 이 경우 page 설정이 불가하여 중복된 데이터를 불러옴
//     // ex) 0~30 , 0~60 , 0 90
//     console.log("추가검색, 현재 페이지 : " + currentImg);
//     search();
//   }
// });

// 검색 시작후 10초후에 검색 결과가 없을 경우 출력할 텍스트, search.html로 연결
setTimeout(() => {
  if (document.querySelector(".row_container").children.length == 0) {
    document.querySelector("#title2").style.opacity = "0";
    setTimeout(() => {
      console.log("맞춤 추천 결과가 없습니다.");
      title2.classList.add("animate__animated");
      title2.classList.add("animate__fadeInUp");
      title2.innerHTML = "😢 앗! 맞춤 추천 결과가 없는 것 같아요.<br> <a href='search.html' id='text_link'><h2 id='title3'>상세 검색페이지를 이용해 보세요!</h2></a>";
      // 로딩바 닫기
      document.querySelector("#loading").classList.remove("active");
      document.querySelector("#title3").classList.add("animate__animated");
      setInterval(() => {
        document.querySelector("#title3").classList.toggle("animate__pulse");
      }, 1000);
    }, 1000);
  }
}, 10000);

//
//
//
//
//
//
//
//
//
//

/** 검색 함수 */
async function search() {
  let json = null;

  try {
    const response = await axios.get("http://api.kcisa.kr/openapi/service/rest/meta16/getkopis01", {
      params: {
        serviceKey: `0197b556-2aa3-44b3-ad89-6eeb90f6a185`,
        numOfRows: 1000,
        pageNo: currentPage,
      },
      header: {
        accept: `application/json`,
      },
    });
    json = response.data.response.body.items.item;
    // console.log(json);
  } catch (e) {
    console.error(e);
    alert("요청을 처리하는데 실패했습니다.");
    return;
  }

  json.forEach((v, i) => {
    const period = v.temporalCoverage.split("~");

    const choosed = new Date(date);
    const startDate = new Date(period[0]);
    startDate.setFullYear(startDate.getFullYear() + 3);
    const endDate = new Date(period[1]);
    endDate.setFullYear(endDate.getFullYear() + 3);

    let A = BigInt(choosed.getTime());
    let B = BigInt(startDate.getTime());
    let C = BigInt(endDate.getTime());
    const A1 = ("" + A).substring(0, 6);
    const B1 = ("" + B).substring(0, 6);
    const C1 = ("" + C).substring(0, 6);

    A = parseInt(A1); // 선택
    B = parseInt(B1); // 시작
    C = parseInt(C1); // 끝

    /** 검색 조건에 따라 필터링*/
    // 장르선택
    if (type.includes(v.subjectCategory)) {
      // 날짜 && 출력갯수
      if (A >= B && A <= C && count <= currentImg) {
        // 로딩바 닫기
        document.querySelector("#loading").classList.remove("active");

        const div = document.createElement("div");
        div.classList.add("rec_container");
        div.classList.add("animate__animated");
        div.classList.add("animate__fadeInUp");
        div.style.setProperty("--animate-duration", count * currentImg + 1000 + "ms");
        count++;

        const img = document.createElement("img");
        img.classList.add("hvr-grow");
        const h3 = document.createElement("h3");
        const h4 = document.createElement("h4");
        const p1 = document.createElement("p");
        const p = document.createElement("p");

        img.setAttribute("src", v.referenceIdentifier);
        h3.innerHTML = v.title;
        h4.innerHTML = v.spatialCoverage;

        p1.innerHTML = v.subjectCategory;

        /** api가 대부분 과거의 공연정보 이기 때문에 공연 기간에 임시로 3년을 더해서 표현합니다. */
        let plusThreeYear = v.temporalCoverage.replaceAll("2020", "2023").replaceAll("2019", "2022").replaceAll("2018", "2021").replaceAll("2017", "2020");
        p.innerHTML = plusThreeYear;
        // 원래 공연기간
        // p.innerHTML = v.temporalCoverage;

        div.addEventListener("click", (e) => {
          window.open(v.url);
        });

        div.appendChild(img);
        div.appendChild(h3);
        div.appendChild(h4);
        div.appendChild(p1);
        div.appendChild(p);

        document.querySelector(".row_container").appendChild(div);
      }
    }
  });

  if (count < currentImg) {
    currentPage++;
    console.log("검색 결과가 부족합니다. 다음 페이지 검색을 시작합니다. page : " + currentPage);
    if (currentPage >= 10) {
      console.log(currentPage + "페이지까지 검색했지만 결과가 나오지 않아 검색을 중단합니다.");
      return;
    }
    search();
  }
}
