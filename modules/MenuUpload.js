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

function stringwash(string){
  sample='①②③⑤⑥⑦⑧⑨⑩⑫⑬⑭⑮⑯⑰⑱';
  for(var i=0;i<string.length;i++){
    if (sample.indexOf(string[i])!=-1){
      string=string.substring(0,i)+string.substring(i+1,string.length);
      i--;
    }else if(string[i]=='a' && string[i+1]=='m'){
      string=string.substring(0,i)+string.substring(i+4,string.length);
      i--;
    }else if(string[i]+string[i+1]=='\r'){
      string=string.substring(0,i)+string.substring(i+2,string.length);
      i--;
    }
  }
  return string;
}

module.exports = function(date,pool,skipday)
{
  var request = require('request')
  var url="http://www.ksa.hs.kr/Home/CafeteriaMenu"
  request(url, function(err, resp, html){//급식간식
    if (err) {throw err};
    var newdate=date.toFormat('YYYY-MM-DD')

    var strArray = html.split('\n');
    var newArray = new Array();
    var menu = new Array();

    for (i=0; i<strArray.length; i++){
      lineText = editString(strArray[i])
      if (lineText != '' && lineText != '\r'){newArray.push(lineText)}
    }

    var add=false
    index=-1
    var submenu=''
    for(var i=0;i<newArray.length;i++){
      if(newArray[i].indexOf('[조식]')!=-1){
        menu.push([newArray[i-1].substring(0,10),'','',''])
        index+=1
        var j=2
        submenu=newArray[i+1]
        while(true){
          submenu+='\n'+newArray[i+j]
          j+=1
          console.log('#')
          console.log(newArray[i+j])
          console.log(newArray[i+j].indexOf('[중식]'))
          // console.log('#')
          // console.log(i)
          // console.log(j)
          // console.log(newArray.length)
          // console.log(newArray[i+j])

          if(newArray[i+j].indexOf('[중식]')!=-1){break}
        }
        menu[index][1]=stringwash(submenu)
        submenu=newArray[i+j+1]
        j+=2
        while(true){
          submenu+='\n'+newArray[i+j]
          j+=1
          if(newArray[i+j].indexOf('[석식]')!=-1||newArray[i+j].indexOf('일자')!=-1){break}
        }
        menu[index][2]=stringwash(submenu)
        submenu=newArray[i+j+1]
        j+=2
        while(true){
          submenu+='\n'+newArray[i+j]
          j+=1
          if(newArray[i+j+1].indexOf('[조식]')!=-1||newArray[i+j+1].indexOf('이메일무단수집거부')!=-1){break}
        }
        menu[index][3]=stringwash(submenu)
        j+=1
      }
    }
    // console.log(menu)



    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query('SELECT uploaddate FROM uploaddate WHERE id = 1;', [], function(err, result){
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)

        done(err);
        if(result["rows"][0]["uploaddate"]!=menu[0][0]){
          console.log('uploading')
          var startdate=result["rows"][0]["uploaddate"]
          var enddate=menu[0][0]
          var year=startdate.substring(0,4)
          var month=startdate.substring(5,7)
          var day=startdate.substring(8,10)
          client.query('DELETE FROM uploaddate WHERE id = 1;', [], function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
              return console.error('error running query', err);
            }
          });
          client.query('INSERT INTO uploaddate(id,uploaddate) VALUES($1,$2);', [1,menu[0][0]], function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
              return console.error('error running query', err);
            }
          });

          while(true){
            client.query('DELETE FROM menu WHERE date = $1;', [year+'-'+month+'-'+day], function(err, result) {
              //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
              done(err);

              if(err) {
                return console.error('error running query', err);
              }
            });
            var deldate=skipday(year,month,day)
            year=deldate[0]
            month=deldate[1]
            day=deldate[2]

            if(year+'-'+month+'-'+day==enddate){break}
          }

          for(var i=0;i<menu.length;i++){
            client.query('INSERT INTO menu(date,breakfast,lunch,dinner) VALUES($1,$2,$3,$4);', [menu[i][0],menu[i][1],menu[i][2],menu[i][3]], function(err, result) {
              //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
              done(err);

              if(err) {
                return console.error('error running query', err);
              }
            });

            if(err) {
              return console.error('error running query', err);
            }
          }
          console.log('menu uploading finished');
        }
      });
    });

    pool.on('error', function (err, client) {
      // if an error is encountered by a client while it sits idle in the pool
      // the pool itself will emit an error event with both the error and
      // the client which emitted the original error
      // this is a rare occurrence but can happen if there is a network partition
      // between your application and the database, the database restarts, etc.
      // and so you might want to handle it and at least log it out
      console.error('idle client error', err.message, err.stack)
    });
  });
}
