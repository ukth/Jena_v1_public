/**
* Created by UKth, department of intelligence on 2017-01-18.
*/

function skipday(year,month,day){
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

module.exports = function(app,fs)
{
  var vacation=true;

  // 키보드
  require('date-utils');
  var config = { //Didn't split config file, so I made copy for github public repository
    user: '#', //env var: PGUSER
    database: '#', //env var: PGDATABASE
    password: '#', //env var: PGPASSWORD
    host: 'ec-#.compute-1.amazonaws.com', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  };

  var pg = require('pg');

  //this initializes a connection pool
  //it will keep idle connections open for a 30 seconds
  //and set a limit of maximum 10 idle clients
  var pool = new pg.Pool(config);

  // to run a query we can acquire a client from the pool,
  // run a query on the client, and then return the client to the pool


  app.get('/keyboard', function(req, res){
    fs.readFile( __dirname + "/../data/" + "keyboard.json", 'utf8', function (err, data) {
      res.end( data );
    });
  });

  app.post('/message',function(req,res){
    console.log(req.body)
    var result = {  };
    // CHECK REQ VALIDITY
    if(!req.body["user_key"] || !req.body["type"] || !req.body["content"]){
      result["success"] = 0;
      result["error"] = "invalid request";
      res.json(result);
      return;
    }
    // 초기 keyboard 버튼일 경우(시작하기)
    var messages = {}
    var sem1 = require('semaphore')(1);
    sem1.take(function() {
      fs.readFile( __dirname + "/../data/message.json", 'utf8',  function(err, data){
        messages = JSON.parse(data);
        sem1.leave();
      });
    });
    sem1.take(function() {
      if(req.body["content"].indexOf("매뉴얼")!=-1||req.body["content"].indexOf("사용법")!=-1||req.body["content"].indexOf("도움말")!=-1||req.body["content"].indexOf("help")!=-1||req.body["content"].indexOf("manual")!=-1){
        // 각 keyboard 버튼에 따른 응답 메시지 설정
        url='https://drive.google.com/open?id=0B9HhET7cAvZHRmpPaEd0Wkg1aGM'
        text="제나가 처음이신가요?"
        label="간단 제나 사용법"
        if(req.body["content"].indexOf("help")!=-1||req.body["content"].indexOf("manual")!=-1){
          url='https://drive.google.com/open?id=0B9HhET7cAvZHa196a1BSUWxMZWs'
          text="Is this your first time using Jena?"
          label="Simple Jena Manual"
        }
        messages["message"] = {
          "text" : text,
          "message_button": {
            "label": label,
            "url": url
          }
        };
        var ans = JSON.stringify(messages);
        console.log("Request_user_key : "+req.body["user_key"]);
        console.log("Request_type : keyboard - "+req.body["content"]);
        console.log("Response_text :"+messages["message"]["text"]);
        res.end(ans);
        sem1.leave();
        return;
      }
      var input=req.body["content"];
      console.log("Request_type : keyboard - "+input);
      console.log("Request_user_key : "+req.body["user_key"]);
      var admin=false;
      var sync=true;
      var active=false;
      var studentid='';
      var stclass='';
      var lastname='';
      var firstname='';
      var sem2 = require('semaphore')(1);
      var sem3 = require('semaphore')(1);
      var client;
      var done;
      var err;
      sem2.take(function() {
        sem3.take(function() {
          pool.connect(function(dberr, dbclient, dbdone) {
            if(err) {
              return console.error('error fetching client from pool', err);
            }

            client=dbclient;
            done=dbdone;
            err=dberr
            sem3.leave();
          });
          //'SELECT id, active FROM userkeys WHERE userkey = $1'
        });
        sem3.take(function() {
          client.query('SELECT * FROM users WHERE userkey = $1', [req.body["user_key"]], function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
              return console.error('error running query', err);
            }
            if(result["rows"].length!=0){
              active = result["rows"][0]["active"];
              studentid = result["rows"][0]["studentid"];
              stclass = result["rows"][0]["stclass"];
              lastname = result["rows"][0]["lastname"];
              firstname = result["rows"][0]["firstname"];
              console.log('active: '+active);
              console.log('studentid: '+studentid);
              console.log('stclass: '+stclass);
              console.log('lastname: '+lastname);
              console.log('firstname: '+firstname);
            }else{
              active = null
              // studentid = result["rows"][0]["studentid"];
              // stclass = result["rows"][0]["stclass"];
              // lastname = result["rows"][0]["lastname"];
              // firstname = result["rows"][0]["firstname"];
            }
            sem3.leave();
            sem2.leave();
          });
        })

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

      sem2.take(function() {
        if(active==null){
          if(input.indexOf("등록")!=-1){
            var newArray=input.split("\n");
            if(newArray.length==4 && newArray[0]=="등록"&&newArray[1].length==6&&newArray[1][2]=="-"&&newArray[3]=="안알랴줌"){
              var stnum=String(newArray[1][0])+String(newArray[1][1])
              sem3.take(function() {
                client.query('INSERT INTO users(userkey,stclass,active,studentid,lastname,firstname) VALUES($1,$2,$3,$4,$5,$6);', [req.body["user_key"],stnum,true, newArray[1],newArray[2][0],newArray[2].substring(1,newArray[2].length)], function(err, result) {
                  //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                  done(err);
                  if(err) {
                    return console.error('error running query', err);
                  }
                  sem3.leave();
                });
              });
              sem3.take(function() {sem3.leave();});
              messages["message"] = {"text" : "등록이 완료되었습니다.\n잘못 입력했거나 이상이 있는 경우에는 정보부로 문의해주세요"};
            }else{
              messages["message"] = {"text" : "입력에 문제가 있거나 인증코드가 다릅니다.\n정보부에 문의해주세요"};
            }

            var ans = JSON.stringify(messages);
            console.log("Response_text :"+messages["message"]["text"]);
            res.end(ans);
            return;
          }
          messages["message"] = {"text" : "등록되지 않은 사용자입니다.\n등록 후 사용해주세요\n제나가 처음이시라면 '사용법'을 검색해보세요!\nIf this is your first time using Jena, Search for 'help'!"};
          var ans = JSON.stringify(messages);
          console.log("Response_text :"+messages["message"]["text"]);
          res.end(ans);
          return;
        }
        if(stclass.indexOf('admin')==0){//관리자 명령어
          var adminCommand=true
          var command=input.split('%')
          if(input.indexOf('차단된')!=-1&&input.indexOf('사용자')!=-1&&input.indexOf('목록')!=-1){
            sem3.take(function() {
              client.query('SELECT studentid FROM users WHERE active=false;', [], function(err, result) {
                done(err);
                if(err) {
                  return console.error('error running query', err);
                }
                if(result["rows"].length==0){
                  messages["message"] = {"text" : "차단된 사용자가 없습니다."};
                  sem3.leave();
                  return;
                }
                banlist=result["rows"][0]["studentid"]
                for(var i=1;i<result["rows"].length;i++){
                  banlist+="\n"+result["rows"][i]["studentid"]
                }
                messages["message"] = {"text" : banlist};
                sem3.leave();
                return;
              });
            });
            sem3.take(function() {sem3.leave();});
          }else if(command[0]=="차단"){
            sem3.take(function() {
              client.query('UPDATE users SET active = false WHERE studentid=$1;', [command[1]], function(err, result) {
                done(err);
                if(err) {
                  return console.error('error running query', err);
                }
                messages["message"] = {"text" : "차단이 완료되었습니다."};
                sem3.leave();
                return;
              });
            });
          }else if(command[0]=="해제"){
            sem3.take(function() {
              client.query('UPDATE users SET active = true WHERE studentid=$1;', [command[1]], function(err, result) {
                done(err);
                if(err) {
                  return console.error('error running query', err);
                }
                messages["message"] = {"text" : "차단이 해제되었습니다."};
                sem3.leave();
                return;
              });
            });
          }else if(command[0]=="디비"){
            sem3.take(function() {
              client.query(command[1], [], function(err, result) {
                done(err);
                if(err) {
                  return console.error('error running query', err);
                }
                var text=''
                if(result["rows"].length==0){text='완료'}
                else(text=JSON.stringify(result["rows"][0]))
                messages["message"] = {"text" : text};
              });
            });
          }else{adminCommand=false}
          sem3.take(function() {sem3.leave();});
          if(adminCommand){
            var ans = JSON.stringify(messages);
            console.log("Response_text :"+messages["message"]["text"]);
            res.end(ans);
            return;
          }
        }//admin command end

        if(active){
          var data = require(__dirname + "/../data/" + "keywords.js");
          function KeywordCheck(inputT,keywords){
            for(var i=0; i<keywords.length;i++){
              if (inputT.indexOf(keywords[i])!=-1){
                return true;
              }
            }
            return false;
          }
          var index=0;

          for(var i=1;i<data.length;i++){
            if(KeywordCheck(input,data[i][1])){
              index=i;
              break;
            }
          }
          if(input.indexOf("시작하기")!=-1){
            messages = {"message": {"text": "안녕하세요, "+firstname+"님!"}}
          }else if(input.indexOf("랜덤오리")!=-1){
            console.log('db insertion starting...')
            require(__dirname +"/../modules/" + "putdatadb")();
          }else if(input.indexOf("랜덤음검")!=-1){
            //ex)랜덤음검,2,견우,3백var ans = JSON.stringify(messages);
            messages = require(__dirname +"/../modules/" + "RandomFoodInspection")(input);
          }else if(input.indexOf("밥")!=-1||input.indexOf("급식")!=-1||input.indexOf("아침")!=-1||input.indexOf("점심")!=-1||input.indexOf("저녁")!=-1){

            var date = new Date();
            sync=false
            var year=date.toFormat('YYYY')
            var month=date.toFormat('MM')
            var day=date.toFormat('DD')
            var t24=date.toFormat('HH24')

            if(t24>=15){
              Ndate=skipday(year,month,day)
              year=Ndate[0]
              month=Ndate[1]
              day=Ndate[2]
            }
            if(input.indexOf('내일')!=-1){
              Ndate=skipday(year,month,day)
              year=Ndate[0]
              month=Ndate[1]
              day=Ndate[2]
            }
            if(input[0]=='2'&&input[4]==input[7]&&input[7]=='-'){
              year=input.substring(0,4);
              month=input.substring(5,7);
              day=input.substring(8,10);
            }
            if(err) {
              return console.error('error fetching client from pool', err);
            }
            console.log(year+'-'+month+'-'+day)
            sem3.take(function() {
              client.query('SELECT breakfast,lunch,dinner FROM menu WHERE date = $1;', [year+'-'+month+'-'+day], function(err, result) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                done(err);
                var text=year+'-'+month+'-'+day+'\n'
                console.log(result)
                if(result["rows"].length==0){text="해당 날짜의 급식이 존재하지 않습니다."}
                else if(input.indexOf('아침')!=-1){
                  text+=result["rows"][0]["breakfast"]
                }else if(input.indexOf('점심')!=-1){
                  text+=result["rows"][0]["lunch"]
                }else if(input.indexOf('저녁')!=-1){
                  text+=result["rows"][0]["dinner"]
                }else{
                  text+='[조식]\n'+result["rows"][0]["breakfast"]+'\n[중식]\n'+result["rows"][0]["lunch"]+'\n[석식]\n'+result["rows"][0]["dinner"]
                }


                if(err) {
                  return console.error('error running query', err);
                }
                messages = {"message":{"text" : text}};
                var ans = JSON.stringify(messages);
                console.log("Response_text :"+messages["message"]["text"]);
                res.end(ans);

                pool.on('error', function (err, client) {
                  // if an error is encountered by a client while it sits idle in the pool
                  // the pool itself will emit an error event with both the error and
                  // the client which emitted the original error
                  // this is a rare occurrence but can happen if there is a network partition
                  // between your application and the database, the database restarts, etc.
                  // and so you might want to handle it and at least log it out
                  console.error('idle client error', err.message, err.stack)
                });
                sem3.leave();
              });
            });
            sem3.take(function() {sem3.leave();});

          }else if(data[index][0]=='C'){
            sync=false
            var request = require('request')
            var URL = data[index][2]
            var text='서비스 대기중'
            sem3.take(function() {
              request(URL, function(err, resp, html){//간식
                if (err) {throw err};
                var date = new Date();
                messages = require(__dirname +"/../modules/" + "HTMLRequest")(input,date,html);
                sem3.leave()
              });
            });
          }else if((input.indexOf("서승욱")!=-1 || input.indexOf("16-047")!=-1)&& input.indexOf("사진")!=-1){
            messages["message"] = {"text" : "안보여줄거예얌"};
          }else if(input.indexOf('학번표')>-1||input.indexOf('학번목록')>-1){//학번표
            messages = require(__dirname +"/../modules/" + "StudentList")(input,data);
          }else if(data[index][0]=='P'){//학번 또는 이름을 입력한 경우
            // if(input.indexOf("프로필")!=-1){
            //   messages["message"] = {"text" : "프로필 기능은 아직 준비중입니다."};
            // }else
            messages = require(__dirname +"/../modules/" + "WhoLivesInKSA")(input,data,index);
            //'P'처리 끝
          }else if(data[index][0]=='T'){
            messages["message"] = {"text" : data[index][2]};
          }else if(data[index][0]=='B'){
            messages["message"] = {
              "text" : data[index][2][0],
              "message_button": {
                "label": data[index][2][1],
                "url": data[index][2][2]
              }
            };

          }else if(data[index][0]=='I'){
            if(input==data[index][1][0]){
              messages["message"] = {"text" : data[index][2]};
            }else{
              messages["message"] = {"text" : "무슨 뜻인지 잘 모르겠어요. 저에게 말을 가르치고 싶다면 이 화면을 캡쳐해서 정보부(서승욱)에게 보내주세요!"};
            }
          }else{
            messages["message"] = {"text" : "오류:정보부에 문의하세요"};
            console.log("ERR!!: undefined kind of respond");
            console.log("index:"+index+"\ndata[index]:"+data[index]+"\ntype:"+data[index][0]);
          }
        }else{
          messages["message"] = {"text" : "차단된 사용자입니다.\n정보부에 문의하세요"};
        }
        sem3.take(function() {
          var ans = JSON.stringify(messages);
          console.log("Response_text :"+messages["message"]["text"]);
          res.end(ans);
          return;
          console.log("등록된 사용자");
          sem3.leave()
        });
      });
    });
  });
  //menuuploade
  var date = new Date();
  var update=date.toFormat('DD');
  if((update==2||update>=21) && !vacation){
    console.log('menu updating...');
    require(__dirname +"/../modules/" + "MenuUpload")(date,pool,skipday);
  }
}
