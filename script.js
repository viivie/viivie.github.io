const URL = "./model/";

let model;
let webcam;
let maxPredictions;
let labelContainer;

let currentFacingMode = "environment";

document
.getElementById("startBtn")
.onclick = startCamera;

document
.getElementById("switchBtn")
.onclick = switchCamera;

async function loadModel(){

    if(model) return;

    model = await tmImage.load(
        URL+"model.json",
        URL+"metadata.json"
    );

    maxPredictions=model.getTotalClasses();

}

async function startCamera(){

    document.getElementById("status").innerText="Loading model...";

    await loadModel();

    if(webcam){

        webcam.stop();

        document.getElementById("webcam-container").innerHTML="";
    }

    webcam=new tmImage.Webcam(
        400,
        400,
        currentFacingMode==="user"
    );

    await webcam.setup({
        facingMode:currentFacingMode
    });

    await webcam.play();

    window.requestAnimationFrame(loop);

    document
        .getElementById("webcam-container")
        .appendChild(webcam.canvas);

    labelContainer=document.getElementById("label-container");

    labelContainer.innerHTML="";

    for(let i=0;i<maxPredictions;i++){

        const div=document.createElement("div");

        div.className="result";

        div.innerHTML=`
            <div class="result-title">
                <span></span>
                <span class="percent"></span>
            </div>

            <progress max="100" value="0"></progress>
        `;

        labelContainer.appendChild(div);

    }

    document.getElementById("status").innerText="Running";

    document.getElementById("switchBtn").disabled=false;

}

async function switchCamera(){

    currentFacingMode =
        currentFacingMode==="environment"
        ? "user"
        : "environment";

    await startCamera();

}

async function loop(){

    webcam.update();

    await predict();

    window.requestAnimationFrame(loop);

}

async function predict(){

    const prediction=
        await model.predict(webcam.canvas);

    for(let i=0;i<prediction.length;i++){

        const percent=(prediction[i].probability*100);

        const row=labelContainer.children[i];

        row.querySelector("span").innerText=
            prediction[i].className;

        row.querySelector(".percent").innerText=
            percent.toFixed(1)+"%";

        row.querySelector("progress").value=
            percent;

    }

}