const scrollTo = (sectionID) => {
	const section = document.querySelector(sectionID);
	section.scrollIntoView();
};

const createEventListener = (sectionLink) => {
	sectionLink.addEventListener('click', (event) => {
		event.preventDefault();
		scrollTo(`#section-${sectionLink.id}`);
	});
};

const main = () => {
	const overview = document.querySelector('#documentation-overview');
	const sectionLinks = overview.querySelectorAll('a');	

	for(const link of sectionLinks) {
		createEventListener(link);
	}
};

main();