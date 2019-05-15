function signUp(){
    return fetch('/customer/signup', {
        method: 'GET',
        credentials: 'include',
    })
       /* .then(response => {
            if (response.status === 200) {
                return response.json()
                    .then(user =>{
                        return user.username;
                    })
            } else {
                throw response.status
            }
        });*/
}

function sendCode(phone){
    return fetch('/customer/sms', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({phone})
    })
}
document.getElementById('sign-up').addEventListener('click', signUp());