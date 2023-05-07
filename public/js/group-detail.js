import { animateCSS, loadPic } from "./exportFn.js";

window.addEventListener('load', async()=>{
    await loadPic()

    const res = await fetch('/home')
    const result = await res.json()
    const userID = result.userInfo.userID
    const balanceTypeTag = document.querySelector('#balance-type')
    const searchParams = new URLSearchParams(location.search);
    const groupID = searchParams.get('groupID')

    if (groupID){
        const res = await fetch(`groups/group-detail?groupID=${groupID}`)
        const result = await res.json()
        balanceTypeTag.innerHTML += `${result.groupBalance >= 0 ? 'You Lent: ' : 'You Borrowed: '}
                                        <span id="user-balance">${result.groupBalance >= 0 ? '(+)$':'(-)$'}${Math.abs(result.groupBalance)}</span>`
        if (result.success){
            const groupMainDiv = document.querySelector('#group-detail-main-div')
            for (let eventInfo of result.groupEventsInfo){
                const eventDate = new Date(eventInfo.date).toDateString()
                groupMainDiv.innerHTML += `<div class="group-event ${eventInfo.due? `settle`:`not-settle`} invisible">
                                                <div class="event-detail">
                                                    <div class="event-name events"><p>Event Name: </p>
                                                        <a href="/event-detail.html?recordId=${eventInfo.record_id}">${eventInfo.name}</a>
                                                    </div>
                                                    <div class="event-date events"><p>Date: </p>
                                                        <div>${eventDate}</div>
                                                    </div>
                                                    <div class="event-msg events"><p>Message: </p>
                                                        <div>${eventInfo.msg}</div>
                                                    </div>
                                                </div>
                                                <div class="event-amount">
                                                    <div class="event-type">${eventInfo.requestor_id === userID ? `You Lent: `: `You Borrowed: `}
                                                        <div>$${eventInfo.amount}</div>
                                                    </div>
                                                </div>
                                            <div class="event-due">${eventInfo.due ? `Settle`: `Not Settle`}</div>
				</div>`
            } 
        }
        const groupEventDivs = [...document.querySelectorAll('.group-event')]
        groupEventDivs.forEach((groupEventDiv, i)=>{
            setTimeout(()=>{
                animateCSS(groupEventDiv, 'animate__bounceIn');
                groupEventDiv.classList.remove('invisible')
            }, 0 + Number(i) * 50)
        })
    }
})