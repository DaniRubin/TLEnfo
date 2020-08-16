//config section
gravitaionalConstentEarth = 3.986004418;

//functions
function readBlob() {
  const files = document.getElementById("files").files;
  if (!files.length) {
    alert("Please select a file!");
    return;
  }
  var file = files[0];
  var start = 0;
  var stop = file.size - 1;
  var reader = new FileReader();
  reader.onloadend = function (evt) {
    if (evt.target.readyState == FileReader.DONE) {
      const fileContent = evt.target.result;
      document.getElementById("textTLE").value = evt.target.result;
    }
  };
  var blob = file.slice(start, stop + 1);
  reader.readAsBinaryString(blob);
}

function Exit(id) {
  document.getElementById(id).style.display = "none";
}
function resetAllBlocks() {
  document.getElementById("TLEprops").style.display = "none";
  document.getElementById("KeplerStat").style.display = "none";
  document.getElementById("CartesianStat").style.display = "none";
}
MainFunction = null
/*Convert the text in the main button*/
function convertTo(str) {
  if (str == "TLE") {
    MainFunction = makeTLEexplain;
    try { document.getElementById("TLEButton").classList.add("btn-pressed") } catch{ };
    try { document.getElementById("KeplarianButton").classList.remove("btn-pressed") } catch{ };
    try { document.getElementById("CartesianButton").classList.remove("btn-pressed") } catch{ };
    try { document.getElementById("backTLE").style.display = "none" } catch { };
    resetAllBlocks();
  }
  if (str == "Cartesian") {
    MainFunction = convertFuncCartesian;
    try { document.getElementById("CartesianButton").classList.add("btn-pressed") } catch{ };
    try { document.getElementById("KeplarianButton").classList.remove("btn-pressed") } catch{ };
    try { document.getElementById("TLEButton").classList.remove("btn-pressed") } catch{ };
    try { document.getElementById("backTLE").style.display = "none" } catch { };
    resetAllBlocks();
  }
  if (str == "Keplarian") {
    MainFunction = convertFuncKepler;
    try { document.getElementById("CartesianButton").classList.remove("btn-pressed") } catch{ };
    try { document.getElementById("TLEButton").classList.remove("btn-pressed") } catch{ };
    try { document.getElementById("KeplarianButton").classList.add("btn-pressed") } catch{ };
    try { document.getElementById("backTLE").style.display = "none" } catch { };
    resetAllBlocks();
  }
}
function convertFunc() {
  try { document.getElementById("backTLE").style.display = "none" } catch { };
  if (MainFunction == null) alert("יש לבחור פונקציונליות");
  else MainFunction();
}


/******************************************************************/
/******************************************************************/
/*                      convertion to TLE                         */
/******************************************************************/
/******************************************************************/

function convertBackToTLE() {
  document.getElementById("backTLE").style.display = "block";

  TLEsecondLine = '';
  const samiMajotAxis = document.getElementById("kepler_1").innerHTML;
  const inclination = document.getElementById("kepler_3").innerHTML;
  const ascendingNode = document.getElementById("kepler_4").innerHTML;
  const argumantPerigee = document.getElementById("kepler_5").innerHTML;
  let eccentricity = document.getElementById("kepler_2").innerHTML;
  let ecc = parseFloat(eccentricity);
  console.log("Eccentricity " + ecc);
  let trueAnomaly = parseFloat(document.getElementById("kepler_6").innerHTML);
  console.log("True anomaly - " + trueAnomaly)

  TLEsecondLine += "2 " + secondLine.slice(2, 7) + "  " + inclination + " " + ascendingNode + " ";
  //make eccentricity part 
  eccentricity = eccentricity * Math.pow(10, eccentricity.toString().length - 2);
  eccentricity = eccentricity.toString().length >= 7 ? eccentricity : new Array(7 - eccentricity.toString().length + 1).join('0') + eccentricity;
  TLEsecondLine += eccentricity + "  " + argumantPerigee + " ";
  //make the mean anomaly?
  const topPart = (Math.cos(degreeToRadians(trueAnomaly)) + ecc);
  const bottomPart = (1 + ecc * Math.cos(degreeToRadians(trueAnomaly)))
  const eccetricAnomaly = radianToDegree(Math.acos(topPart / bottomPart));
  let meanAnomaly = (eccetricAnomaly - ecc * Math.sin(degreeToRadians(eccetricAnomaly)));
  if (trueAnomaly < 0) meanAnomaly = 360 - meanAnomaly;
  console.log("mean anomaly - " + trueAnomaly)
  TLEsecondLine += meanAnomaly.toFixed(4) + " ";
  //make meanMotion
  let meanMotion = (86400 / (2 * Math.PI)) * Math.sqrt((gravitaionalConstentEarth * Math.pow(10, 5)) / Math.pow(semiMajorAxis, 3))
  TLEsecondLine += meanMotion.toString().slice(0, 11) + " ";

  document.getElementById("backTLE").innerHTML = TLEsecondLine;
  console.log(TLEsecondLine)
}

/******************************************************************/
/******************************************************************/
/*                          Keplerian                             */
/******************************************************************/
/******************************************************************/

function FindKeplerFromTLE(line) {
  meanMotion = parseFloat(line.slice(52, 63));
  meanAnomaly = parseFloat(line.slice(43, 51));
  meanMotionRadian = (Math.PI * 2 * meanMotion) / 86400;
  gravity = gravitaionalConstentEarth * Math.pow(10, 5);
  semiMajorAxis = Math.pow(gravity / Math.pow(meanMotionRadian, 2), 1 / 3).toFixed(3);
  Eccentricity = parseFloat("0." + secondLine.slice(26, 33));
  returnArray = [];
  returnArray.push(semiMajorAxis);
  returnArray.push(Eccentricity);
  returnArray.push(parseFloat(secondLine.slice(8, 16)));
  returnArray.push(parseFloat(secondLine.slice(17, 25)));
  returnArray.push(parseFloat(secondLine.slice(34, 42)));
  returnArray.push(getTrueAnamoly(Eccentricity, meanAnomaly, 14));
  return returnArray;
}


function convertFuncKepler() {
  resetAllBlocks();
  returnArray = getDATAandSplit();
  console.log(returnArray)
  if (returnArray) {
    insertKepler(returnArray[2]);
    document.getElementById("KeplerStat").style.display = "inline-block";
  }
}

function getTrueAnamoly(Eccentricity, meanAnomaly, dp) {
  i = 0; maxIter = 30;
  delta = Math.pow(10, -dp);
  meanAnomaly = meanAnomaly % 360;
  meanAnomaly = (meanAnomaly * 2.0 * Math.PI) / 360.0;
  eccentricAnomaly = Eccentricity < 0.8 ? meanAnomaly : Math.PI;
  F = eccentricAnomaly - Eccentricity * Math.sin(meanAnomaly) - meanAnomaly;
  while ((Math.abs(F) > delta) && (i < maxIter)) {
    eccentricAnomaly = eccentricAnomaly - F / (1.0 - Eccentricity * Math.cos(eccentricAnomaly));
    F = eccentricAnomaly - Eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
    i = i + 1;
  }
  eccentricAnomalyDegree = ((eccentricAnomaly * 180.0) / Math.PI).toFixed(dp);
  sin = Math.sin(eccentricAnomaly);
  cos = Math.cos(eccentricAnomaly);
  fak = Math.sqrt(1.0 - Math.pow(Eccentricity, 2));
  phi = (((Math.atan2(fak * sin, cos - Eccentricity)) * 180.0) / Math.PI).toFixed(4);
  return phi;
}

function insertKepler(line) {
  keplerParams = FindKeplerFromTLE(line);
  document.getElementById("kepler_1").innerHTML = keplerParams[0];
  document.getElementById("kepler_2").innerHTML = keplerParams[1];
  document.getElementById("kepler_3").innerHTML = keplerParams[2];
  document.getElementById("kepler_4").innerHTML = keplerParams[3];
  document.getElementById("kepler_5").innerHTML = keplerParams[4];
  document.getElementById("kepler_6").innerHTML = keplerParams[5];
}

/******************************************************************/
/******************************************************************/
/*                          Cartesian                             */
/******************************************************************/
/******************************************************************/

function insertCartesian(CartesianParams) {
  document.getElementById("Cart_1").innerHTML = CartesianParams[0][0];
  document.getElementById("Cart_2").innerHTML = CartesianParams[0][1];
  document.getElementById("Cart_3").innerHTML = CartesianParams[0][2];
  document.getElementById("Cart_4").innerHTML = CartesianParams[1][0];
  document.getElementById("Cart_5").innerHTML = CartesianParams[1][1];
  document.getElementById("Cart_6").innerHTML = CartesianParams[1][2];
}

function showCartesianData(a, e, i, omegaBig, omegaSmall, trueAnomaly) {
  LocVector = [], VelVector = [], ConversionMetrix = [], elementMatrix = []
  //make variebles to radians
  trueAnomalyR = trueAnomaly * Math.PI / 180
  omegaBig = omegaBig * Math.PI / 180
  omegaSmall = omegaSmall * Math.PI / 180
  iR = i * Math.PI / 180
  //Location vector
  LocVector.push((a * Math.cos(trueAnomalyR)) / (1 + (e * Math.cos(trueAnomalyR))))
  LocVector.push((a * Math.sin(trueAnomalyR)) / (1 + e * Math.cos(trueAnomalyR)))
  LocVector.push(0)
  console.log(LocVector)
  //velocety vector
  VelVector.push((-(Math.sqrt((gravitaionalConstentEarth * Math.pow(10, 5) / a)) * Math.sin(trueAnomalyR))))
  VelVector.push((Math.sqrt((gravitaionalConstentEarth * Math.pow(10, 5) / a)) * (e + Math.cos(trueAnomalyR))))
  VelVector.push(0)
  console.log(VelVector)
  //Convertion metrix
  elementMatrix.push(((Math.cos(omegaBig) * Math.cos(omegaSmall)) - (Math.sin(omegaBig) * Math.sin(omegaSmall) * Math.cos(iR))))
  elementMatrix.push((-(Math.cos(omegaBig) * Math.sin(omegaSmall)) - (Math.sin(omegaBig) * Math.cos(omegaSmall) * Math.cos(iR))))
  elementMatrix.push((Math.sin(omegaBig) * Math.sin(iR)))
  ConversionMetrix.push(elementMatrix)
  elementMatrix = []
  elementMatrix.push(((Math.sin(omegaBig) * Math.cos(omegaSmall)) + (Math.cos(omegaBig) * Math.sin(omegaSmall) * Math.cos(iR))))
  elementMatrix.push((-(Math.sin(omegaBig) * Math.sin(omegaSmall)) + (Math.cos(omegaBig) * Math.cos(omegaSmall) * Math.cos(iR))))
  elementMatrix.push((-(Math.cos(omegaBig) * Math.sin(iR))))
  ConversionMetrix.push(elementMatrix)
  elementMatrix = []
  elementMatrix.push(((Math.sin(omegaSmall) * Math.sin(iR))))
  elementMatrix.push(((Math.cos(omegaSmall) * Math.sin(iR))))
  elementMatrix.push((Math.cos(iR)))
  ConversionMetrix.push(elementMatrix)
  elementMatrix = []
  console.log(ConversionMetrix)
  LocVector = multiplieMetrix(ConversionMetrix, LocVector)
  console.log("Final Location - " + LocVector)
  VelVector = multiplieMetrix(ConversionMetrix, VelVector)
  console.log("Final Velocity - " + VelVector)
  return [LocVector, VelVector]
}

function convertFuncCartesian() {
  resetAllBlocks();
  returnArray = getDATAandSplit();
  if (returnArray) {
    array = FindKeplerFromTLE(returnArray[2]);
    returnArray = showCartesianData(array[0], array[1], array[2], array[3], array[4], array[5]);
    insertCartesian(returnArray)
    document.getElementById("CartesianStat").style.display = "inline-block";
  }
}




/******************************************************************/
/******************************************************************/
/*                      GENRAL MODULES                            */
/******************************************************************/
/******************************************************************/

function degreeToRadians(degree) {
  return degree / 57.2958;
}
function radianToDegree(radian) {
  return radian * 57.2958;
}

/*splits the data to */
function getDATAandSplit() {
  const data = document.getElementById("textTLE").value;
  // alert(data);
  if (data == "") {
    alert("Didnt found TLE file");
    return false;
  } else {
    if (data.split("\n")[0].length > 50) {
      firstLine = data.split("\n")[0];
      secondLine = data.split("\n")[1];
      return [data, firstLine, secondLine];
    } else {
      firstLine = data.split("\n")[1];
      secondLine = data.split("\n")[2];
      return [data, firstLine, secondLine];
    }
  }
}

function multiplieMetrix(mat1, mat2) {
  resultMatrix = []
  for (i = 0; i < mat1.length; i++) {
    sum = 0
    for (j = 0; j < mat2.length; j++) {
      sum += mat1[i][j] * mat2[j]
    }
    resultMatrix.push(sum.toFixed(8))
  }
  return resultMatrix
}


/******************************************************************/
/******************************************************************/
/*                        TLE EXPLAIN                             */
/******************************************************************/
/******************************************************************/


function resetTLEexplain() {
  document.getElementById("param_1_1").innerHTML = "";
  document.getElementById("param_1_2").innerHTML = "";
  document.getElementById("param_1_3").innerHTML = "";
  document.getElementById("param_1_4").innerHTML = "";
  document.getElementById("param_1_5").innerHTML = "";
  document.getElementById("param_1_6").innerHTML = "";
  document.getElementById("param_1_7").innerHTML = "";
  document.getElementById("param_1_8").innerHTML = "";
  document.getElementById("param_1_9").innerHTML = "";
  document.getElementById("param_1_10").innerHTML = "";
  document.getElementById("param_1_11").innerHTML = "";
  document.getElementById("param_1_12").innerHTML = "";
  document.getElementById("param_1_13").innerHTML = "";
  document.getElementById("param_1_14").innerHTML = "";
  document.getElementById("param_2_1").innerHTML = "";
  document.getElementById("param_2_2").innerHTML = "";
  document.getElementById("param_2_3").innerHTML = "";
  document.getElementById("param_2_4").innerHTML = "";
  document.getElementById("param_2_5").innerHTML = "";
  document.getElementById("param_2_6").innerHTML = "";
  document.getElementById("param_2_7").innerHTML = "";
  document.getElementById("param_2_8").innerHTML = "";
  document.getElementById("param_2_9").innerHTML = "";
  document.getElementById("param_2_10").innerHTML = "";
}
function insertTLEexplain1(firstLine) {
  document.getElementById("param_1_1").innerHTML = firstLine.split(" ")[0];
  document.getElementById("param_1_2").innerHTML = firstLine.slice(2, 7);
  document.getElementById("param_1_3").innerHTML = firstLine.slice(7, 8);
  document.getElementById("param_1_4").innerHTML = firstLine.slice(9, 11);
  document.getElementById("param_1_5").innerHTML = firstLine.slice(11, 14);
  document.getElementById("param_1_6").innerHTML = firstLine.slice(14, 17);
  document.getElementById("param_1_7").innerHTML = firstLine.slice(18, 20);
  document.getElementById("param_1_8").innerHTML = firstLine.slice(20, 32);
  document.getElementById("param_1_9").innerHTML = firstLine.slice(33, 43);
  document.getElementById("param_1_10").innerHTML = firstLine.slice(44, 52);
  document.getElementById("param_1_11").innerHTML = firstLine.slice(53, 61);
  document.getElementById("param_1_12").innerHTML = firstLine.slice(62, 63);
  document.getElementById("param_1_13").innerHTML = firstLine.slice(64, 68);
  document.getElementById("param_1_14").innerHTML = firstLine.slice(68, 69);
}
function insertTLEexplain2(secondLine) {
  document.getElementById("param_2_1").innerHTML = secondLine.split(" ")[0];
  document.getElementById("param_2_2").innerHTML = secondLine.slice(2, 7);
  document.getElementById("param_2_3").innerHTML = secondLine.slice(8, 16);
  document.getElementById("param_2_4").innerHTML = secondLine.slice(17, 25);
  document.getElementById("param_2_5").innerHTML = secondLine.slice(26, 33);
  document.getElementById("param_2_6").innerHTML = secondLine.slice(34, 42);
  document.getElementById("param_2_7").innerHTML = secondLine.slice(43, 51);
  document.getElementById("param_2_8").innerHTML = secondLine.slice(52, 63);
  document.getElementById("param_2_9").innerHTML = secondLine.slice(63, 68);
  document.getElementById("param_2_10").innerHTML = secondLine.slice(68, 69);
}

// make TLE Reader
function makeTLEexplain() {
  resetAllBlocks();
  returnArray = getDATAandSplit();
  if (returnArray) {
    document.getElementById("TLEprops").style.display = "inline-block";
    resetTLEexplain();
    insertTLEexplain1(returnArray[1]);
    insertTLEexplain2(returnArray[2]);
  }
}