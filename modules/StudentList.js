module.exports = function(input,data)
{
  if(input.indexOf("15")!=-1){
    var stn="15"
  }else if(input.indexOf("16")!=-1){
    var stn="16"
  }else if(input.indexOf("17")!=-1){
    var stn="17"
  }else{
    return {"message":{"text" : "올바른 학번과 함께 입력해주세요"}};
  }
  var stlist=``;
  for (i=0; i<450; i++){
    if (data[i][0]=='P'){
      var sn=data[i][1][0].split('-');
      if (sn[0]==stn){
        if (stlist.length>0){
          stlist+='\n';
        }
        stlist=stlist+data[i][1][0]+' '+data[i][1][2];
      }
    }
  }
  return {"message":{"text" : stlist}};

}
