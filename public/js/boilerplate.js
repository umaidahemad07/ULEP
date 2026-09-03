const home = document.querySelector('.home');
const myWork = document.querySelector('.my-work');
const myPost = document.querySelector('.my-post');
const profile = document.querySelector('.profile');
const postJob = document.querySelector('.post-job');
const takeTask = document.querySelector('.take-task');
const activeTab = document.querySelector('.active-tab');

 
switch (activeTab.innerText.trim()) {
    case "myWork":   myWork.classList.add("active"); break;
    case "myPost":   myPost.classList.add("active"); break;
    case "profile":  profile.classList.add("active"); break;
    case "postJob":  postJob.classList.add("active"); break;
    case "takeTask": takeTask.classList.add("active"); break;
    case "home":     home.classList.add("active"); break;
    default:         home.classList.add("active");
}