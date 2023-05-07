export function animateCSS(node, animation) {
	node.classList.add('animate__animated');
	node.classList.add(animation);

	function handleAnimationEnd(e) {
		e.stopPropagation();
		node.classList.remove(`animate__animated`);
		node.classList.remove(animation);
	}
	node.addEventListener('animationend', handleAnimationEnd);
}

export async function loadPic() {
	const userPic = document.querySelector('.member-pic-div');
    const res = await fetch('/home')
    const result = await res.json()
    userPic.innerHTML += `<img src="${result.userInfo.image ? `uploads/${result.userInfo.image}` : `image/default_profile.jpg`}" 
    alt="profile-image" class="profile-pic" />`
}