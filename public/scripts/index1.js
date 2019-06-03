console.log("index.js IN");
var attr = document.createElement('li');
var year_month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
var year_day = ['MON','TUE', 'WED', 'THU', 'FRI','SAT','SUN']
function addVote () {
  var d= new Date();
  let vote_title = document.getElementsByName('vote_input')[0].value;
  let vote_content = document.getElementsByName('vote_input2')[0].value;
  let vote_month = d.getMonth();
  let vote_date = d.getDate();
  let vote_year = d.getFullYear();
  let vote_day = d.getDay();
  if (vote_title.length === 0 || vote_content.length ===0) {
    console.log('Wrong input');
    return;
  }
  addElem({
    title : vote_title,
    content : vote_content,
    month: vote_month,
    date: vote_date,
    year: vote_year,
    day: vote_day
  });
  event.preventDefault();
  document.getElementById('addForm').submit();
  document.getElementById('addForm').reset();
  scrollDown();
  
}

function loadVote () {
  console.log("fuck")
  axios.get('http://ssal.sparcs.org:33133/vote/retrieve')
  .then(function (response) {
    while(document.getElementById('vote-list').hasChildNodes()) {
      document.getElementById('vote-list').removeChild(document.getElementById('vote-list').firstChild);
    }
    const data = response.data;
    for (let i=data.length-1; i>=0; i--){
      console.log(i)
      console.log(data[i].user)
      if (document.getElementsByClassName('hidden')[0].value=="undefined" && data[i].user=="false"){
        addElem({
          title : data[i].title,
          content : data[i].content,
          month: data[i].month,
          date: data[i].date,
          year: data[i].year,
          day: data[i].day
        });  
      }
      else if (data[i].title!= undefined && data[i].user==document.getElementsByClassName('hidden')[0].value){
        addElem({
          title : data[i].title,
          content : data[i].content,
          month: data[i].month,
          date: data[i].date,
          year: data[i].year,
          day: data[i].day
        });

      }
    }
  })
  .catch(function (error) {
    // console.log("DB Error")
  })
}

function addElem (val) {
  var vote = document.createElement('dt');
  vote.className = "vote-elem";
  console.log(val.date);
  vote.innerHTML = 
    `<input type="hidden" class="hidden-input" name=${encodeURIComponent(JSON.stringify(val))}></input>
    <div class="left-text"><font size="3">${year_month[val.month]} ${val.date}</font> <font size="5">${year_day[val.day]}</font></div>
    <input type="button" class="large-button" onclick="showContent(this)" value=${(JSON.stringify(val.title))}}></input>
    <input type="button" class="remove-button" onclick="removeElem(this)" value="DELETE"></input>
    `;
  if (document.getElementById("vote-list")!=null){
    document.getElementById("vote-list").appendChild(vote);
  }
  
}

function showContent (arg) {
  if(arg.parentElement.nextSibling==null || arg.parentElement.nextSibling.tagName=="DT"){
    var vote = document.createElement('dd');
    vote.className = "vote-content"
    console.log(arg.parentElement)
    var val = JSON.parse(decodeURIComponent(arg.parentElement.getElementsByClassName('hidden-input')[0].name));
    console.log(val.content);
    vote.innerHTML = 
      `
      <div class="content">
      <textarea class="content-text" readonly>${val.content}</textarea>
      <input type="button" value="EDIT" class="content-button" onclick="update(this)"></input>
      </div>
      `
    arg.parentElement.getElementsByClassName('large-button')[0].style.cssText="color: rgb(11, 153, 219);"
    arg.parentElement.style.cssText="border-bottom: 4px solid rgb(11, 153, 219);"
    arg.parentElement.after(vote)
    console.log(arg.parentElement.nextSibling)
    arg.parentElement.nextSibling.getElementsByClassName('content-text')[0].style.cssText="resize:none;"
    autosize(arg.parentElement.nextSibling.getElementsByClassName('content-text')[0])

  }
  else{
    arg.parentElement.style.cssText="border-bottom: 3px solid rgb(111, 197, 236);"
    arg.parentElement.getElementsByClassName('large-button')[0].style.cssText="color: rgb(111, 197, 236);"
    arg.parentElement.nextSibling.remove()
  }
  
  
}
function update(arg){
  arg.parentElement.getElementsByClassName("content-text")[0].readOnly=false;
  arg.value="SAVE"
  arg.onclick= function(){save(arg)};
}

function save(arg){
  console.log("3")
  console.log(arg)
  console.log("3")
  console.log(arg.parentElement.parentElement.getElementsByClassName("content-text")[0].value)
  console.log(arg.parentElement.parentElement.previousSibling.getElementsByClassName('hidden-input')[0])
  var val = JSON.parse(decodeURIComponent(arg.parentElement.parentElement.previousSibling.getElementsByClassName('hidden-input')[0].name));
  val.content = arg.parentElement.parentElement.getElementsByClassName("content-text")[0].value;
  console.log(val.content)
  axios.post('/vote/update', val)
  console.log(arg.parentElement.parentElement.getElementsByClassName("content-text")[0].readOnly)
  arg.parentElement.parentElement.getElementsByClassName("content-text")[0].readOnly=true;
  arg.value="EDIT"
  arg.onclick=function(){update(arg)}
}

function removeElem (arg) {
  console.log(  document.getElementsByClassName("vote-elem")[0].title)
  console.log(arg.parentElement.getElementsByClassName('hidden-input')[0].name)
  console.log(1)
  var val = JSON.parse(decodeURIComponent(arg.parentElement.getElementsByClassName('hidden-input')[0].name));
  console.log(val);
  if (arg.parentElement.nextSibling==null){
    axios.post('/vote/del', val)
    .then((res) => {
      document.getElementById("vote-list").removeChild(arg.parentElement);
    });
    return
  }
  if(!(arg.parentElement.nextSibling.tagName=="DT")){
    arg.parentElement.nextSibling.remove()
  }
  axios.post('/vote/del', val)
  .then((res) => {
    document.getElementById("vote-list").removeChild(arg.parentElement);
  });
}

function scrollDown () {
  var voteList = document.getElementById("vote-list");
  voteList.scrollTop = voteList.scrollHeight - voteList.clientHeight;
}
function auto(){
  autosize(document.getElementsByClassName("notes")[0])
}