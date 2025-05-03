import moment from "moment"
function formatmessage(username,text){
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}

export default formatmessage