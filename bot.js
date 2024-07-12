




const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

//Ai function
var popover = new bootstrap.Popover(document.getElementById('ai-bot'), {
container: 'body',
html: true,
content: function () {
    return document.getElementById('popover-content').innerHTML;
},
boundary: 'viewport',
sanitize: false
});

function sendMessage() {
alert("Sorry for inconvenience we working on AI BOT.........")
}


function closePopover() {
popover.hide();
}