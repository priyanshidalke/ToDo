class ToDoComponent extends React.Component
{
constructor(props)
{
super(props);
this.username=props.username;
this.usercode=props.user_code;
this.toDos=[];
var category={"code":0,"title":"Categories"};
this.state={"categories":[],"toDos":[],"selectedCategory":category};
fetch("http://localhost:5050/getCategories").then(response=>response.json()).then(response=>{
this.categories=[];
var category;
for(let i=0;i<response.categories.length;++i)
{
category=response.categories[i];
this.categories.push(category);
}
this.loadToDos();
this.setState({"categories":this.categories});
});
}
loadToDos()
{
var xmlhttp = new XMLHttpRequest();
var outerThis=this;
xmlhttp.onreadystatechange = function()
{
if(xmlhttp.readyState == XMLHttpRequest.DONE)
{
if (xmlhttp.status == 200)
{
outerThis.toDos=[];
var l=JSON.parse(xmlhttp.responseText).toDos;
for(let i=0;i<l.length;++i)
{
if(l[i].user_code==outerThis.usercode)
{
outerThis.toDos.push(l[i]);
}
}
outerThis.setState({"toDos":outerThis.toDos});
}
else if (xmlhttp.status == 400)
{
alert('There was an error 400');
}
else
{
alert('something else other than 200 was returned');
}
}
};
xmlhttp.open("GET","http://localhost:5050/getToDos"+"?username="+this.username,true);
xmlhttp.send();
}
addToDo()
{
var xmlhttp = new XMLHttpRequest();
var outerThis=this;
xmlhttp.onreadystatechange = function()
{
if(xmlhttp.readyState == XMLHttpRequest.DONE)
{
if (xmlhttp.status == 200)
{
var r=JSON.parse(xmlhttp.responseText);
var toDo=r.toDo;
document.getElementById('addToDoTitle').value="";
outerThis.toDos.push(toDo);
outerThis.selectedCategoryChanged(outerThis.state.selectedCategory);
}
else if (xmlhttp.status == 400)
{
alert('There was an error 400');
}
else
{
alert('something else other than 200 was returned');
}
}
};
xmlhttp.open("GET","http://localhost:5050/addToDo"+"?category_code="+this.state.selectedCategory.code+"&username="+this.username+"&title="+this.toDoToAddTitle+"&date="+this.toDoToAddDateTime,true);
xmlhttp.send();
}
addToDoModal()
{
if(this.state.selectedCategory.code!=0)
{
$('#addToDoModal').modal('show');
}
else
{
alert('Please Select a Category First');
}
}
selectedCategoryChanged(category)
{
this.state.toDos=[]
for(var i=0;i<this.toDos.length;++i)
{
if(this.toDos[i].category_code==category.code)
{
this.state.toDos.push(this.toDos[i]);
}
}
this.setState({"selectedCategory":category})
}
titleChangeEventHandler(ev)
{
this.toDoToAddTitle=ev.target.value;
}
dateTimeChangeEventHandler(ev)
{
this.toDoToAddDateTime=ev.target.value;
}
titleUpdateChangeEventHandler(ev)
{
this.toDoToUpdateTitle=ev.target.value;
}
dateTimeUpdateChangeEventHandler(ev)
{
this.toDoToUpdateDateTime=ev.target.value;
}
updateToDo()
{
var xmlhttp = new XMLHttpRequest();
var outerThis=this;
var toDo=this.toDoToBeUpdated;
xmlhttp.onreadystatechange = function()
{
if(xmlhttp.readyState == XMLHttpRequest.DONE)
{
if(xmlhttp.status == 200)
{
var r=JSON.parse(xmlhttp.responseText);
let index=0;
let td;
for(let i=0;i<outerThis.toDos.length;++i)
{
td=outerThis.toDos[i];
if(td.code==toDo.code)
{
index=i;
break;
}
}
document.getElementById('updateToDoTitle').value="";
outerThis.toDos[index].title=outerThis.toDoToUpdateTitle;
outerThis.toDos[index].date=outerThis.toDoToUpdateDateTime;
outerThis.selectedCategoryChanged(outerThis.state.selectedCategory);
alert('To Do Updated');
}
else if (xmlhttp.status == 400)
{
alert('There was an error 400');
}
else
{
alert('something else other than 200 was returned');
}
}
};
xmlhttp.open("GET","http://localhost:5050/updateToDo"+"?category_code="+this.state.selectedCategory.code+"&username="+this.username+"&title="+this.toDoToUpdateTitle+"&date="+this.toDoToUpdateDateTime+"&code="+toDo.code,true);
xmlhttp.send();
}
deleteToDo()
{
var toDo=this.toDoToBeDeleted;
var xmlhttp = new XMLHttpRequest();
var outerThis=this;
xmlhttp.onreadystatechange = function()
{
if(xmlhttp.readyState == XMLHttpRequest.DONE)
{
if (xmlhttp.status == 200)
{
let index=0;
let tD;
for(let i=0;i<outerThis.toDos.length;++i)
{
tD=outerThis.toDos[i];
if(tD.code==toDo.code)
{
index=i;
break;
}
}
outerThis.toDos.splice(index,1);
outerThis.selectedCategoryChanged(outerThis.state.selectedCategory);
alert('To Do Deleted');
}
else if (xmlhttp.status == 400)
{
alert('There was an error 400');
}
else
{
alert('something else other than 200 was returned');
}
}
};
xmlhttp.open("GET","http://localhost:5050/deleteToDo"+"?code="+toDo.code,true);
xmlhttp.send();
}
convertDateTimeString(dt)
{
return "Date :"+dt.replace("T"," Time :");
}
render()
{
return (
<div>
<h1>To Do Manager : </h1><br/>
<label>Select Category  :&nbsp;&nbsp;</label>
<span class="dropdown">
  <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
    {this.state.selectedCategory.title}
  </button>
<div class="dropdown-menu">
{
this.state.categories.map(category=>{
return (
<li class="dropdown-item" onClick={()=>{this.selectedCategoryChanged(category)}}><h5>{category.title}</h5></li>
)
})
}
  </div>
</span>
&nbsp;&nbsp;<button onClick={this.addToDoModal.bind(this)}>Add a To Do</button><br/><br/>
<table class="table table-striped table-bordered table-hover">
  <thead>
    <tr>
      <th scope="col">S.No.</th>
      <th scope="col">Title</th>
      <th scope="col">Date&Time</th>
      <th scope="col"></th>
      <th scope="col"></th>
    </tr>
  </thead>
  <tbody>
{
this.state.toDos.map((toDo,index)=>{
return (
    <tr class='clickable-row' data-href='url://' >
      <th scope="row">{index+1}</th>
      <td>{toDo.title}</td>
      <td>{this.convertDateTimeString(toDo.date)}</td>
      <td><button data-toggle="modal" data-target="#updateToDoModal"  onClick={()=>{this.toDoToBeUpdated=toDo}} ><span class="glyphicon glyphicon-pencil"></span></button></td>
      <td><button data-toggle="modal" data-target="#deleteToDoModal" onClick={()=>{this.toDoToBeDeleted=toDo}} > <span class="glyphicon glyphicon-trash"></span> </button></td>
    </tr>
)
})
}
  </tbody>
</table>

<div id="addToDoModal" class="modal fade" role="dialog">
<div class="modal-dialog">

    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Add To Do</h4>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>
      <div class="modal-body">
<b>Enter Title &nbsp;:&nbsp;</b>&nbsp;<input type="text" id="addToDoTitle" onChange={this.titleChangeEventHandler.bind(this)}  /><br/>
<b>Enter Date & Time &nbsp;:&nbsp;</b>&nbsp;<input type="datetime-local" id="addToDoData&Time" onChange={this.dateTimeChangeEventHandler.bind(this)}  />
      </div>
      <div class="modal-footer">
          <button class="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
         <button class="btn btn-primary" type='submit' data-dismiss="modal" id="addToDoButton" onClick={this.addToDo.bind(this)}>Add</button>
      </div>
    </div>

  </div>
</div>
<div id="deleteToDoModal" class="modal fade" role="dialog">
  <div class="modal-dialog">

    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Delete To Do</h4>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>
      <div class="modal-body">
<b>Are You Sure You want to delete this To Do?</b><br/>
      </div>
      <div class="modal-footer">
          <button class="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
         <button class="btn btn-primary" type='submit' data-dismiss="modal" id="deleteToDoButton" onClick={this.deleteToDo.bind(this)}>Delete</button>
      </div>
    </div>

  </div>
</div>
<div id="updateToDoModal" class="modal fade" role="dialog">
  <div class="modal-dialog">

    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Update To Do</h4>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>
      <div class="modal-body">
<b>Enter Title &nbsp;:&nbsp;</b>&nbsp;<input type="text" id="updateToDoTitle" onChange={this.titleUpdateChangeEventHandler.bind(this)}  /><br/>
<b>Enter Date & Time &nbsp;:&nbsp;</b>&nbsp;<input type="datetime-local" id="updateToDoData&Time" onChange={this.dateTimeUpdateChangeEventHandler.bind(this)}  />
      </div>
      <div class="modal-footer">
          <button class="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
         <button class="btn btn-primary" data-dismiss="modal" type='submit' id="updateToDoButton" onClick={this.updateToDo.bind(this)}>Update</button>
      </div>
    </div>

  </div>
</div>

</div>
)
}
}