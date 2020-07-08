"use strict";

import Request from './request.js';
import Store from './store.js';
import App from './app.js';

// helper functions
const $ = (elementID) => {
  const element = document.querySelector(elementID);
  if(!element) {
    throw `Element Not Found: ${elementID}`;
  }
  return element;
};

// event handlers
// make new request dialogue visible
const handleCreateRequest = (event) => {
  event.preventDefault();
  $('#newRequest').classList.remove('d-none');
  // focus URL field
  $('#newRequestURL').focus();

  App.Event('RequestDialogueVisible');
};

// hide new request dialogue
const handleCloseRequestDialogue = (event) => {
  event.preventDefault();
  $('#newRequest').classList.add('d-none');

  App.Event('RequestDialogueNotVisible');
};

// reset form on new request dialogue hide
const handleFormReset = (event) => {
  event.preventDefault();

  $('#newRequestURL').value = "";
  $('#httpMethodMenu').value = "get";
  $('#newRequestJSONPayload').value = "";

  // hide optional JSON field
  $('#newRequestOptionalField').classList.add('d-none');

  // reset submit button
  App.Event('NewRequestSubmitButtonReset');
};

// watch current HTTP Method selection in new request dialogue
const handleNewRequestHTTPMethod = (event) => {
  event.preventDefault();
  const selection = $('#httpMethodMenu').value;
  App.Event('NewRequestHTTPMethodSelection', { detail: selection });
};

// enable optional JSON field in new request dialogue
const handleNewRequestEnableOptionalFields = (event) => {
  event.preventDefault();
  const optionalField = $('#newRequestOptionalField');

  if(event.detail === 'post') {
    optionalField.classList.remove('d-none');
    App.Event('RequestOptionalFieldEnabled', { detail: true });
  } else {
    optionalField.classList.add('d-none');
    App.Event('RequestOptionalFieldEnabled', { detail: false });
  }
};

// get values on form submit
const handleFormSubmit = (event) => {
  event.preventDefault();

  const formData = {
    url: $('#newRequestURL').value,
    method: $('#httpMethodMenu').value,
  };

  if(formData.method === 'post') {
    formData.jsonPayload = $('#newRequestJSONPayload').value;
  }

  App.Event('FormSubmit', {detail: formData});
};

// validate new request form
const handleFormValidation = (event) => {
  event.preventDefault();

  // validate JSON field
  if(event.detail.method === 'post') {
    try {
      const json = JSON.parse(event.detail.jsonPayload);
    } catch (error) {
      // validation errors
      App.Event('NewRequestJSONInvalid');
      return;
    }
  }

  // if JSON field in error state, restore it
  App.Event('NewRequestJSONReset');

  // pass the validated form data to the next event handler
  App.Event('NewRequestFormValidated', { detail: event.detail });
};

// put the new request form JSON field in error state
const handleNewRequestJSONInvalid = (event) => {
  event.preventDefault();

  const jsonField = $('#newRequestOptionalField');
  jsonField.classList.add('error');

  const errorMsg = jsonField.querySelector('p');
  errorMsg.style.display = 'contents';
};

const handleNewRequestJSONReset = (event) => {
  event.preventDefault();

  const jsonField = $('#newRequestOptionalField');
  if(jsonField.classList.contains('error')) {
    jsonField.classList.remove('error');

    const errorMsg = jsonField.querySelector('p');
    errorMsg.style.display = 'none';
  }
};

const handleNewRequestSubmitButtonDisable = (event) => {
  event.preventDefault();

  const formSubmitButton = $('#newRequest').querySelector('input.button-primary');
  formSubmitButton.disabled = true;
  formSubmitButton.value = 'Sending';
};

const handleNewRequestSubmitButtonReset = (event) => {
  event.preventDefault();
  const submitButton = $('#newRequest').querySelector('input.button-primary');
  submitButton.disabled = false;
  submitButton.value = 'Send';
};

const handleValidatedForm = (event) => {
  event.preventDefault();

  // disable the submit button
  App.Event('NewRequestDisableSubmitButton');

  // send request
  switch (event.detail.method) {
    case 'get':
      Request.Get(event.detail.url, (responseObj) => {
        App.Event('APIResponseReceived', {detail: responseObj })
      });
      break;

    case 'post':
      try {
        Request.Post(event.detail.url, event.detail.jsonPayload, (responseObj) => {
          App.Event('APIResponseReceived', {detail: responseObj })
        });
      } catch (error) {
        App.Event('NewLogEntry', {detail: error})
      }
      break;

    default:
      try {
        Request.Other(event.detail.url, event.detail.method, (responseObj) => {
          App.Event('APIResponseReceived', {detail: responseObj })
        });
      } catch (error) {
        App.Event('NewLogEntry', {detail: error})
      }
  }

  // create a log entry
  const LogEntry = `Sending ${event.detail.method.toUpperCase()} Request to ${event.detail.url}`;
  App.Event('NewLogEntry', {detail: LogEntry});

  // create history entry
  App.Event('NewHistoryEntry', {detail: event.detail});
};

const handleAPIResponseReceived = (event) => {
  event.preventDefault();

  // close new request dialogue
  App.Event('CloseNewRequestDialogue');

  // enable response status details
  App.Event('EnableResponseStatus', { detail: event.detail });

  // write response body
  App.Event('WriteResponseBody', {detail: event.detail.body});

  // create log entry
  App.Event('NewLogEntry', {detail: 'Response Received'});
};

const handleEnableResponseStatus = (event) => {
  event.preventDefault();

  const resStatus = $('#responseStatus');
  resStatus.classList.remove('d-none');

  resStatus.querySelector('#httpStatus').innerHTML = event.detail.status;
  resStatus.querySelector('#responseDelay').innerHTML = event.detail.timeElapsed;
};

const handleWriteResponseBody = (event) => {
  event.preventDefault();
  const responseArea = $('#responseBody');
  responseArea.innerHTML = JSON.stringify(event.detail, false, 2);
};

const handleNewLogEntry = (event) => {
  event.preventDefault();

  const time = new Date();
  const currentTime = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}]  `;

  const logOutput = $('#logOutput');
  logOutput.innerHTML += `${currentTime} ${event.detail}\n`;
};

const handleNewHistoryEntry = (event) => {
  event.preventDefault();
  const row = document.createElement('tr');

  row.innerHTML = `
    <td><img src="static/images/play.svg"></td>
    <td id="historyURL">${event.detail.url}</td>
    <td id="historyMethod">${event.detail.method.toUpperCase()}</td>`;

  $('#historyEntries').appendChild(row);

  // this feels like cheating, but it is the cleanest way
  row.onclick = () => App.Event('CreateRequestFromHistory', {detail: event.detail});

  // store history in browser local storage
  App.Event('AddToLocalStorage', {detail: event.detail});
};

const handleAddToLocalStorage = (event) => {
  event.preventDefault();

  let database = [];
  const record = event.detail;

  if(Store.Get('RequestHistory') === null) {
    console.log('database:', database);
    database.push(record);
    Store.Add('RequestHistory', database);
  } else {
    database = Store.Get('RequestHistory');
    database.push(record);
    Store.Update('RequestHistory', database);
  }
};

const handleCreateRequestFromHistory = (event) => {
  event.preventDefault();
  console.log(event.detail);

  App.Event('CreateNewRequest');
  $('#newRequestURL').value = event.detail.url;
  $('#httpMethodMenu').value = event.detail.method;

  if(event.detail.method === 'post') {
    $('#newRequestOptionalField').classList.remove('d-none');
    $('#newRequestJSONPayload').value = event.detail.jsonPayload;
  }
};

// register events and handlers here
const eventHandlers = [
  {
    target: '#buttonCreateRequest',
    eventName: 'click',
    eventHandler: handleCreateRequest
  },
  {
    target: App.RootElement,
    eventName: 'CreateNewRequest',
    eventHandler: handleCreateRequest
  },
  {
    target: '#closeRequestDialogue_1',
    eventName: 'click',
    eventHandler: handleCloseRequestDialogue
  },
  {
    target: '#closeRequestDialogue_2',
    eventName: 'click',
    eventHandler: handleCloseRequestDialogue
  },
  {
    target: App.RootElement,
    eventName: 'RequestDialogueNotVisible',
    eventHandler: handleFormReset
  },
  {
    target: '#httpMethodMenu',
    eventName: 'change',
    eventHandler: handleNewRequestHTTPMethod
  },
  {
    target: App.RootElement,
    eventName: 'NewRequestHTTPMethodSelection',
    eventHandler: handleNewRequestEnableOptionalFields
  },
  {
    target: '#newRequestForm',
    eventName: 'submit',
    eventHandler: handleFormSubmit
  },
  {
    target: App.RootElement,
    eventName: 'FormSubmit',
    eventHandler: handleFormValidation
  },
  {
    target: App.RootElement,
    eventName: 'NewRequestJSONInvalid',
    eventHandler: handleNewRequestJSONInvalid
  },
  {
    target: App.RootElement,
    eventName: 'NewRequestJSONReset',
    eventHandler: handleNewRequestJSONReset
  },
  {
    target: App.RootElement,
    eventName: 'NewRequestDisableSubmitButton',
    eventHandler: handleNewRequestSubmitButtonDisable
  },
  {
    target: App.RootElement,
    eventName: 'NewRequestSubmitButtonReset',
    eventHandler: handleNewRequestSubmitButtonReset
  },
  {
    target: App.RootElement,
    eventName: 'NewRequestFormValidated',
    eventHandler: handleValidatedForm
  },
  {
    target: App.RootElement,
    eventName: 'APIResponseReceived',
    eventHandler: handleAPIResponseReceived
  },
  {
    target: App.RootElement,
    eventName: 'CloseNewRequestDialogue',
    eventHandler: handleCloseRequestDialogue
  },
  {
    target: App.RootElement,
    eventName: 'EnableResponseStatus',
    eventHandler: handleEnableResponseStatus
  },
  {
    target: App.RootElement,
    eventName: 'WriteResponseBody',
    eventHandler: handleWriteResponseBody
  },
  {
    target: App.RootElement,
    eventName: 'NewLogEntry',
    eventHandler: handleNewLogEntry
  },
  {
    target: App.RootElement,
    eventName: 'NewHistoryEntry',
    eventHandler: handleNewHistoryEntry
  },
  {
    target: App.RootElement,
    eventName: 'AddToLocalStorage',
    eventHandler: handleAddToLocalStorage
  },
  {
    target: App.RootElement,
    eventName: 'CreateRequestFromHistory',
    eventHandler: handleCreateRequestFromHistory
  }
];

for(const handler of eventHandlers) {
  const target = $(handler.target);
  target.addEventListener(handler.eventName, handler.eventHandler);
}

// keyboard shortcuts
window.onkeyup = (event) => {
  const key = event.key;
  // console.log(key);

  switch(key) {
    case 'n':
      App.Event('CreateNewRequest');
      break;

    case 'Escape':
      App.Event('CloseNewRequestDialogue');
      break
  }
};