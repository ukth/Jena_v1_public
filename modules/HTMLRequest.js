function skipday(year,month,day,url){
  if(month==12){
    if(day==31){
      return [String(Number(year)+1),'01','01'];
    }
  }

  if(month==01&&day==31){
    return [year,String(Number(month)+1),'01'];
  }else if((Number(year)%4!=0 && month==02 && day==28) || (Number(year)%4==0 && month==02 && day==29)){
    return [year,'03','01'];
  }else if(month==03&&day==31){
    return [year,'04','01'];
  }else if(month==04&&day==30){
    return [year,'05','01'];
  }else if(month==05&&day==31){
    return [year,'06','01'];
  }else if(month==06&&day==30){
    return [year,'07','01'];
  }else if(month==07&&day==31){
    return [year,'08','01'];
  }else if(month==08&&day==31){
    return [year,'09','01'];
  }else if(month==09&&day==30){
    return [year,'10','01'];
  }else if(month==10&&day==31){
    return [year,'11','01'];
  }else if(month==11&&day==30){
    return [year,'12','01'];
  }else if(month==12&&day==31){
    return [year,'01','01'];
  }else{
    var d=Number(day)+1;
    if(d>=10){
      return [year,month,String(d)];
    }
    return [year,month,'0'+String(d)];
  }
}

function editString(str){
  var add = true;
  var newStr = "";
  for (var i=0; i<str.length; i++){
    if (str[i] == ' ') {continue}
    if (str[i] == '\t') {continue}
    if (str[i] == '<') {add = false}
    if (add) {newStr = newStr + str[i]}
    if (str[i] == '>') {add = true}
  }
  return newStr
}


module.exports = function(input,date,html)
{
  var strArray = html.split('\n');
  var newArray = new Array();
  var t24=date.toFormat('HH24');
  console.log(t24)

  // for (var i=0; i<strArray.length; i++){
  //   console.log(strArray[i]);
  // }

  for (i=0; i<strArray.length; i++){
    lineText = editString(strArray[i])
    if (lineText != '' && lineText != '\r'){newArray.push(lineText)}
  }
  // for (var i=0; i<newArray.length; i++){
  //   console.log(newArray[i]);
  // }

  if(input.indexOf('간식')!=-1){

    var Sindex=0;
    var tmr=false;
    var td=false;
    if(t24>=15){td=true}
    if(input.indexOf('내일')!=-1){tmr=true}
    console.log(tmr)
    console.log(td)
    if ((tmr && !td)||(!tmr && td)){
      console.log('12시~9시 or 내일 입력 하나만')
      newArray[newArray.indexOf('간식')]='';
    }

    Sindex = newArray.indexOf('간식');
    var snack = newArray[Sindex+1];
    var day=newArray[Sindex-4];

    if(!tmr && td){
      console.log('내일 없고 시간만 지났을때')
      day=day.slice(2,day.length);
      day='오늘'+day;
    }
    text=day+"의 간식\n"+snack
    if(tmr && td){
      console.log('시간 지나고 내일도 입력')
      text="아직 내일간식이 업로드되지 않았어요!"
    }
  }else{
    text="오류, 해당 'C'객체가 존재하지 않습니다.\n정보부에 문의하세요";
  }
  return {"message":{"text" : text}};
}
