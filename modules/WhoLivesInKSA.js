module.exports = function(input,data,index)
{
  if(input.indexOf(data[index][1][2])!=-1){ //이름입력
    //이름 입력한경우
    var cnt=0;
    var slist="";
    var mes="";
    var name=data[index][1][2];
    var twoname=false;
    for(var i=1;i<450;i++){
      if(input.indexOf(data[i][1][2])!=-1 && data[i][0]=='P'){
        if(data[i][1][2]!=name){
          twoname=true;
          break;
        }
        if(cnt>0){
          slist+=",";
        }
        slist+=`${data[i][1][0]}`;
        cnt++;
      }
    }
    if(twoname){
      return {"message":{"text" : "이름을 하나만 입력해주세요!"}};
    }else if(cnt>1){
      mes="동명이인\n"
      return {"message":{"text" : mes+slist}};
    }else if(input.indexOf("사진")!=-1){                         //사진탐색기
      return {"message":{
        "text": "",
        "photo": {
          "url": "http://sas.ksa.hs.kr//uploadfiles/SCTSTUDENTN/"+data[index][1][0]+".jpg",
          "width": 329,
          "height": 439
        }}};      //사진탐색기 end
    }else{
      return {"message":{"text" : data[index][1][2]+" 학생의 학번은 "+data[index][1][0]+"입니다."}};
    }
  }else if(input.indexOf("사진")!=-1){                         //사진탐색기
    return{"message":{
      "text": "",
      "photo": {
        "url": "http://sas.ksa.hs.kr//uploadfiles/SCTSTUDENTN/"+data[index][1][0]+".jpg",
        "width": 329,
        "height": 439
      }}};      //사진탐색기 end
  }else if(input.indexOf(data[index][1][0])!=-1 || input.indexOf(data[index][1][1])!=-1){ //번호입력
    return {"message":{"text" : data[index][1][0]+"은 "+data[index][1][2]+" 학생입니다."}};
  }else{
    return {"message":{"text" : "오류:정보부에 문의하세요"}};
    console.log("사람객체가 감지되지 않음");
  }
}
