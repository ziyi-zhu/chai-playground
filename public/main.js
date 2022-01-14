var i = 0;
var response = '';
var suffix = '';
var speed = 10;

var botName = 'Jessica';
var botImg = 'https://data.whicdn.com/images/302058504/original.jpg?t=1511579073';
var userName = 'User';
var stopSeq = [`${botName}:`, `${userName}:`, "\n"]

var temperature = 0.6;
var topK = 40;
var topP = 1;
var repPenalty = 1.1;
var resLength = 64;

var presets = [
  `\`\${botName} is a friendly and talkative person. \${userName} wants to chat and have some fun with \${botName}.\n\n\${botName}: Hey there :) My name is \${botName}.\n\${userName}: Hi, how are you today?\n\${botName}: I'm feeling great. How about you?\n\${userName}:\``,
  `\`\${botName} is feeling lonely and horny today. \${userName} wants to have some naughty chats with \${botName}.\n\n\${botName}: Hey cutie ;) My name is \${botName}.\n\${userName}: Hey honey, how are you feeling today?\n\${botName}: I'm so lonely right now. Are you available?\n\${userName}:\``,
]
var botPreset = 0;

const SenderMessage = ({ img, message }) => `
  <div class="media w-75 mb-3"><img src="${img}" alt="user" width="50" class="rounded-circle">
    <div class="media-body ml-3">
      <div class="bg-light rounded py-2 px-3 mb-2">
        <p class="text-small mb-0 text-muted">${message}</p>
      </div>
      <p class="small text-muted">12:00 PM | Aug 13</p>
    </div>
  </div>
`;

const RecieverMessage = ({ message }) => `
  <div class="media w-75 ml-auto mb-3">
    <div class="media-body">
      <div class="bg-primary rounded py-2 px-3 mb-2">
        <p class="text-small mb-0 text-white">${message}</p>
      </div>
      <p class="small text-muted">12:00 PM | Aug 13</p>
    </div>
  </div>
`;

$(document).ready(function(){
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });

  $("[type=range]").change(function(){
    var newval = $(this).val();
    $(this).tooltip('hide')
           .attr('data-original-title', newval)
           .tooltip('show');
  });

  $("#prompt").change(function(event) {
    updateBotInfo();
    renderChatBox();
  });
    
  $("#target").change(function(event) {
    event.preventDefault();

    botName = $("#botNameInput").val();
    botPreset = parseInt($("#presetSelect").children("option:selected").val());

    temperature = parseFloat($("#temperature").val());
    topK = parseInt($("#topK").val());
    topP = parseFloat($("#topP").val());
    repPenalty = parseFloat($("#repPenalty").val());
    resLength = parseInt($("#resLength").val());

    if ($('#stopSeq').is(":checked")) {
      stopSeq = [`${botName}:`, `${userName}:`, "\n"];
    } else {
      stopSeq = [];
    };

    $("#prompt").val(eval(presets[botPreset]));

    updateBotInfo();
    renderChatBox();
  });

  $("#chatSubmit").click(function(event) {
    event.preventDefault();

    let userInput = $("#userInput").val();
    $("#userInput").val("");
    if (userInput) {
      $("#loading").show();
      $("#generate").attr("disabled", true);

      let prompt = $("#prompt").val();
      $("#prompt").val(prompt + ' ' + userInput + `\n${botName}:`);

      renderChatBox();
      generateResponse();
    } 
  });

  $("#generate").click(function(event) {
    $("#loading").show();
    $("#generate").attr("disabled", true);
    generateResponse();
  });

  initialise();
});

function initialise() {
  $("#prompt").val(eval(presets[botPreset]));
  $("#loading").hide();

  updateBotInfo();
  renderChatBox();
}

function generateResponse() {
  let prompt = $("#prompt").val();
  let lastSender = $("#prompt").val().split("\n").pop().split(":").shift();
  
  if (lastSender == userName) {
    suffix = `\n${botName}:`;
  } else if (lastSender == botName) {
    suffix = `\n${userName}:`;
  } else {
    suffix = "";
  }

  request(prompt);
}

function request(prompt) {
  let json = {
    "text": prompt,
    "top_p": topP,
    "top_k": topK,
    "temperature": temperature,
    "repetition_penalty": repPenalty,
    "length": resLength,
    "stop_sequences": stopSeq
  };
  console.log(json);

  $.ajax({
    url: 'https://1f7ef2e4-chai.forefront.link',
    type : 'POST',
    headers: {
      'Authorization': 'Bearer d6f979add8f748498a2de065'
    },
    contentType: "application/json",
    data: JSON.stringify(json),
    success: function (data) {
      updatePrompt(data);
    },
    error : function (data, errorThrown) {
      console.log(data);
    },
    complete: function (data) {
      $("#loading").hide();
      $("#generate").removeAttr("disabled");
    }
  });
}

function getSenderMessage(message) {
  let sender, text;
  if (message.startsWith(`${userName}:`)) {
    sender = userName;
    text = message.substring(userName.length + 1).trim();
  } else if (message.startsWith(`${botName}:`)) {
    sender = botName;
    text = message.substring(botName.length + 1).trim();
  }
  if (text) {
    return { "sender": sender, "text": text };
  }
}

function renderChatBox() {
  $('#conversation').empty();
  let messages = $("#prompt").val().split("\n");
  for (let i = 0; i < messages.length; i++) {
    let message = getSenderMessage(messages[i]);
    if (message) {
      if (message.sender == userName) {
        $('#conversation').append(
          RecieverMessage({
            message: message.text
          })
        );
      } else {
        $('#conversation').append(
          SenderMessage({
            img: botImg,
            message: message.text
          })
        );
      }
    } 
  }
  $("#chatBox").scrollTop(function() { return this.scrollHeight; });
}

function updateBotInfo() {
  $('#botName').text(botName);
  $('#botInfo').text($("#prompt").val().split("\n").shift());
  $('#botImg').attr("src", botImg);
}


function updatePrompt(data) {
  if ($("ul#tabs-tab li a.active").text() == 'Raw') {
    speed = 10;
  } else {
    speed = 0;
  }

  i = 0;
  response = data.result[0].completion;
  typeWriter();
}

function typeWriter() {
  let text = response;
  if (stopSeq.length != 0) {
    text += suffix;
  }
  if (i < text.length) {
    let prompt = $("#prompt").val();
    $("#prompt").val(prompt + text.charAt(i));
    i++;
    setTimeout(typeWriter, speed);
  } else {
    renderChatBox();
  }
}