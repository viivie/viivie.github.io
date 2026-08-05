const URL = "./model/";

let model;
let webcam;
let maxPredictions;
let labelContainer;

document
.getElementById("startBtn")
.addEventListener("click", init);

async function init(){

    try{

        document.getElementById("status").innerText="載入模型中...";

        model = await tmImage.load(
            URL+"model.json",
            URL+"metadata.json"
        );

        maxPredictions=model.getTotalClasses();

        webcam=new tmImage.Webcam(300,300,true);

        await webcam.setup();

        await webcam.play();

        window.requestAnimationFrame(loop);

        document
        .getElementById("webcam-container")
        .appendChild(webcam.canvas);

        labelContainer=document.getElementById("label-container");

        labelContainer.innerHTML="";

        for(let i=0;i<maxPredictions;i++){

            const row=document.createElement("div");

            row.className="result";

            row.innerHTML=`
                <span></span>
                <progress value="0" max="100"></progress>
            `;

            labelContainer.appendChild(row);

        }

        document.getElementById("status").innerText="辨識中";

    }catch(e){

        console.error(e);

        document.getElementById("status").innerText="載入失敗";

    }

}

async function loop(){

    webcam.update();

    await predict();

    window.requestAnimationFrame(loop);

}

async function predict(){

    const prediction=await model.predict(webcam.canvas);

    for(let i=0;i<prediction.length;i++){

        const row=labelContainer.children[i];

        const span=row.querySelector("span");

        const progress=row.querySelector("progress");

        const percent=(prediction[i].probability*100).toFixed(1);

        span.innerHTML=`${prediction[i].className} ${percent}%`;

        progress.value=percent;

    }

}