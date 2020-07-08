const sections = ['#about', '#features'];

const scrollTo = (sectionID) => {
	const section = document.querySelector(sectionID);
	section.scrollIntoView();
};

document.getElementById('nextSection').addEventListener('click', (event) => {
	event.preventDefault();
	scrollTo(sections[1]);
});
