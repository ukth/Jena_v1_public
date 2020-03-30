module.exports = function(input)
{
  var newArray=input.split(",");
  var roomnum=Number(newArray[3]);
  var dorm=newArray[1]
  var line=newArray[2];
  if(dorm.length==2&&line.length==2&&roomnum!=0){
    if(dorm=="견우"){
      if(line=="3백"){
        var rooms=["323","324","325","326","327","328","331","332","333","334","335","336","337","338","339","340","341","342"];
      }else if(line=="3창"){
        var rooms=["301","302","303","304","305","306","307","308","309","310","311","312","313","314","317","318","319","320","321"];
      }else if(line=="4백"){
        var rooms=["423","424","425","426","427","436","437","438","439","440","441","442"];
      }else if(line=="4창"){
        var rooms=["401","402","403","404","405","406","407","408","409","410","411","412","413","419","420","421"];
      }else if(line=="5백"){
        var rooms=["523","524","525","526","527","528","529","530","531","532","533","534","535","536","537","538","539"];
      }else if(line=="5창"){
        var rooms=["501","502","503","504","505","506","507","508","509","510","511","512","513","514","516","517","518","519","520","521"];
      }else{
        return {"message":{"text" : "정확한 라인을 입력해주세요"}};
      }

    }else if(dorm=="직녀"){
      if(line=="3층"){
        var rooms=["301","302","303","304","305","306","307","308","309","310","311","312","313","314","315","316","317"];
      }else if(line=="4층"){
        var rooms=["401","402","403","404","405","406","407","408","410","411","412","413","414"];
      }else{
        return {"message":{"text" : "정확한 라인을 입력해주세요"}};
      }
    }else{
      return {"message":{"text" : "정확한 건물을 입력해주세요"}};
    }
    i=0
    var list=[]
    while (i<roomnum){
      index=Math.floor(Math.random()*rooms.length + 0);
      if(list.indexOf(rooms[index])!=-1){
        continue;
      }
      list.push(rooms[index]);
      i+=1
    }
    var resp=list[0];
    for(var i=1;i<roomnum;i++){
      resp+=','+list[i];
    }
    return {"message":{"text" : resp}};
  }else{
    return {"message":{"text" : "입력방법에 오류가 있습니다\n정보부에 문의하세요"}};
  }
}
