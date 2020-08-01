// API - URL endpoint
var AJAXurl = url + "ajax/api/";
var currentBooks = [];

$(document).ready(() => {
    createEventListeners();
});

//display form for get or delete
function getdeleteForm(type) {
    message = "Delete book record";
    if (type == "get") {
        message = "Search book record";
    }

    return (`
          <h2> ${message} </h2>
          <form id ="getdeleteForm" onsubmit="return false">
            <label for="id">ID:</label>
            <input name="id" id="id">
            <p>Leave blank for all records</p>
            <button id="btn-get-delete" onclick="getRecords("${type}")">${type.toUpperCase()}</button>
          </form>
    `)
}
//display form for add or update
function addupdateForm(type) {
    message = "Add new book record";
    if (type == "put") {
        message = "Update exisitng book record";
        disabled = "disabled";
    }else {
        disabled ="";
    }
    return (`
          <h2> ${message} </h2>
          <form id ="addupdateForm" onsubmit="return false">
            <label for="id">ID: </label><input name="id" id="id" ${disabled}><br>
            <label for="title">Title: </label><input name="title" id="title"><br>
            <label for="author">Author: </label><input name="author" id="author"><br>
            <label for="publisher">Publisher: </label><input name="publisher" id="publisher"><br>
            <label for="year">Year: </label><input name="year" id="year"><br>
            <button id="btn-add-update"> ${type.toUpperCase()}</button>
          </form>
    `)
}
// create book record table
function displayBooks(responseJson) {
    $('#result').show();
    $('#ajax-form').hide();
   // for book array from AJAX
   if (Array.isArray(responseJson) && responseJson.length>0) { 
    var table = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Publisher</th>
                        <th>Year</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        //display data in array in table
        responseJson.forEach(book => {
            table += `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.publisher}</td>
                <td>${book.year}</td>
                <td>
                    <button id="btn-row-edit" onclick="processEdit(${book.id})">Edit</button>
                    <button id="btn-row-delete" onclick="processDelete(${book.id})">Delete</button>
                </td>
            </tr>
            `;
        });

        table += `
            </tbody>
        </table>
        `;
        $('#result').html(table);
    } else { //Response message from AJAX
        $('#result').html(responseJson);
    }
}

// Get record in json with AJAX
function processAJAX(method='get', id='', sendData) {
    try {
        if (method == 'get' || method == 'delete') {
            sendData = null;
        } else {
            sendData = JSON.stringify(sendData);
        }; 
        var newURL = AJAXurl + id;
        var data = new XMLHttpRequest();
        data.open(method, newURL, true);
        data.setRequestHeader('Content-type', 'application/json ; charset=UTF-8');
        data.send(sendData);
        data.onreadystatechange = () => {
            if (data.readyState == 4 && data.status == 200) {
                if (data.responseText.length == 0){ // if JSON is empty 
                } else {
                    var responseJson = JSON.parse(data.responseText);
                    if (method == 'get') { // set global value of currentBooks after get
                        currentBooks = responseJson;
                    }
                }
                displayBooks(responseJson);
            } 
        } 
    } catch (err) {
        $('#result').html("<h2> Error! Unable to retrieve book records!</h2>");
    }
}

function processDelete(id) {
    processAJAX("delete", id, "");
}

function processEdit(id) {
    //display form for editting book
    $('#ajax-form').html(addupdateForm('put'));
    $('#btn-add-update').click(() => {
        processAJAX('put', id, getSendData());
    });
    $('#ajax-form').show();
    $('#result').hide();

    //find index of editting book
    let index = currentBooks.findIndex(book => book.id == id);
    if (index != -1) {
        var book = currentBooks[index];
        //prefill form
        $('input#id').val(book.id);
        $('input#title').val(book.title);
        $('input#author').val(book.author);
        $('input#publisher').val(book.publisher);
        $('input#year').val(book.year);
    }   
}

function getSendData(){
    let newBook = {
        'id': $("input#id").val(),
        'title':$("input#title").val(),
        'author': $("input#author").val(),
        'publisher': $("input#publisher").val(),
        'year': $("input#year").val()
    };
    return newBook;
}

function createEventListeners() {
    //get button form
    $('#btn-get').click(() => {
        $('#ajax-form').show();
        $('#result').hide();
        $('#ajax-form').html(getdeleteForm('get'));
        $('#btn-get-delete').click(() => {
            var id = $("input#id").val();
            processAJAX('get', id, null);
        });
    });
    //delete button form
    $('#btn-delete').click(() => {
        $('#ajax-form').show();
        $('#result').hide();
        $('#ajax-form').html(getdeleteForm('delete'));
        $('#btn-get-delete').click(() => {
            var id = $("input#id").val();
            processAJAX('delete', id, "");
        });
    });
    //add button form
    $('#btn-add').click(() => {
        $('#ajax-form').show();
        $('#result').hide();
        $('#ajax-form').html(addupdateForm('post'));
        $('#btn-add-update').click(() => {
            processAJAX('post','', getSendData());
        });
    });
    //update button form
    $('#btn-update').click(() => {
        processAJAX('get', '', null);
    });
}