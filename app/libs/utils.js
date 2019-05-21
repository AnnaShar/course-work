
function leaveDigitsOnly(text){
    let result = '';
    for (let i=0; i<text.length; i++){
        if (!isNaN(parseInt(text[i],10)))
            result+=text[i];
    }
    return result;
}

module.exports=leaveDigitsOnly;