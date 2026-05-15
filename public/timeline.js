const timelineData = [
    {
        title: "Announcement",
        icon: "fa-bullhorn",
        description: "The Election Commission announces the dates for the elections, including the model code of conduct coming into effect."
    },
    {
        title: "Nomination",
        icon: "fa-file-signature",
        description: "Candidates file their nomination papers, declaring their assets, criminal records (if any), and educational qualifications."
    },
    {
        title: "Campaign",
        icon: "fa-people-group",
        description: "Political parties and candidates campaign to win voter support through rallies, manifestos, and public meetings."
    },
    {
        title: "Voting Day",
        icon: "fa-check-to-slot",
        description: "Eligible voters go to polling booths to cast their votes using Electronic Voting Machines (EVMs) and VVPATs."
    },
    {
        title: "Counting",
        icon: "fa-calculator",
        description: "Votes are counted under heavy security and strict observation by Election Commission officials and candidate representatives."
    },
    {
        title: "Result",
        icon: "fa-trophy",
        description: "Final results are declared. The party or coalition with a majority forms the government."
    }
];

function initTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    timelineData.forEach((item) => {
        const el = document.createElement('div');
        el.className = 'timeline-item';
        el.innerHTML = `
            <div class="timeline-icon"><i class="fa-solid ${item.icon}"></i></div>
            <div class="timeline-content">
                <h3 class="translatable" data-original="${item.title}">${item.title}</h3>
                <p class="translatable" data-original="${item.description}">${item.description}</p>
            </div>
        `;
        container.appendChild(el);
    });
}

// Run immediately — script.js's langToggle listener will see these elements
// because translation is triggered by user interaction, not on load.
document.addEventListener('DOMContentLoaded', initTimeline);
