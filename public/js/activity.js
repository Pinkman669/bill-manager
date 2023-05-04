
//const eventName = document.getElementById('activity')
//const eventDate = document.getElementById('date')
const totalAmount = document.getElementById('amount')
const numOfPeople = document.getElementById('people')
const dividedBy = document.getElementById('denominator')

const billSplitter = () => {
    let amount = parseInt(totalAmount);
    let people = parseInt(numOfPeople);
    let result = document.getElementById('averageAmount');

    if (true) {
        let denominator = parseInt(dividedBy);
        const averagePayment = (totalAmount /denominator);
        console.log(averagePayment);
        result.innerHTML = averagePayment;
        
    }
}

//const splitStarter = document.querySelector('equally')
//splitStarter.addEventListener('click', (event) => {
    //result.innerHTML = event.target.value;
//})