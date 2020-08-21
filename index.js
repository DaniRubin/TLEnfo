//config section
gravitaionalConstentEarth = 398600.4418;

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
MainFunction = null;
/*Convert the text in the main button*/
function convertTo(str) {
  if (str == "TLE") {
    MainFunction = makeTLEexplain;
    try {
      document.getElementById("TLEButton").classList.add("btn-pressed");
    } catch { }
    try {
      document
        .getElementById("KeplarianButton")
        .classList.remove("btn-pressed");
    } catch { }
    try {
      document
        .getElementById("CartesianButton")
        .classList.remove("btn-pressed");
    } catch { }
    try {
      document.getElementById("backTLE").style.display = "none";
    } catch { }
    resetAllBlocks();
  }
  if (str == "Cartesian") {
    MainFunction = convertFuncCartesian;
    try {
      document.getElementById("CartesianButton").classList.add("btn-pressed");
    } catch { }
    try {
      document
        .getElementById("KeplarianButton")
        .classList.remove("btn-pressed");
    } catch { }
    try {
      document.getElementById("TLEButton").classList.remove("btn-pressed");
    } catch { }
    try {
      document.getElementById("backTLE").style.display = "none";
    } catch { }
    resetAllBlocks();
  }
  if (str == "Keplarian") {
    MainFunction = convertFuncKepler;
    try {
      document
        .getElementById("CartesianButton")
        .classList.remove("btn-pressed");
    } catch { }
    try {
      document.getElementById("TLEButton").classList.remove("btn-pressed");
    } catch { }
    try {
      document.getElementById("KeplarianButton").classList.add("btn-pressed");
    } catch { }
    try {
      document.getElementById("backTLE").style.display = "none";
    } catch { }
    resetAllBlocks();
  }
}
function convertFunc() {
  try {
    document.getElementById("backTLE").style.display = "none";
  } catch { }
  if (MainFunction == null) alert("יש לבחור פונקציונליות");
  else MainFunction();
}

/******************************************************************/
/******************************************************************/
/*                      convertion to TLE                         */
/******************************************************************/
/******************************************************************/

function convertBackToTLE() {
  //getting all the values of the kepler
  const samiMajotAxis = parseFloat(document.getElementById("kepler_1").innerHTML);
  const inclination = parseFloat(document.getElementById("kepler_3").innerHTML);
  const ascendingNode = parseFloat(document.getElementById("kepler_4").innerHTML);
  const argumantPerigee = parseFloat(document.getElementById("kepler_5").innerHTML);
  let eccentricity = parseFloat(document.getElementById("kepler_2").innerHTML);
  let trueAnomaly = parseFloat(document.getElementById("kepler_6").innerHTML);

  //sending the values to the function and displays the answer
  document.getElementById("backTLE").style.display = "block";
  const TLEsecondLine = convertKeplerToTLE(samiMajotAxis, inclination, ascendingNode, argumantPerigee, eccentricity, trueAnomaly)
  document.getElementById("backTLE").innerHTML = TLEsecondLine;
  console.log(TLEsecondLine);
}

function convertKeplerToTLE(semiMajorAxis, inclination, ascendingNode, argumantPerigee, eccentricity, trueAnomaly) {
  TLEsecondLine = "";
  let ecc = parseFloat(eccentricity);
  TLEsecondLine += "2 " + secondLine.slice(2, 7) + "  " + inclination.toFixed(4) + " " + ascendingNode.toFixed(4) + " ";
  //make eccentricity part
  // eccentricity = eccentricity * Math.pow(10, eccentricity.toString().length - 2);
  // eccentricity = eccentricity.toString().length >= 7 ? eccentricity : new Array(7 - eccentricity.toString().length + 1).join("0") + eccentricity;
  TLEsecondLine += eccentricity.toFixed(7).toString().split('.')[1] + "  " + argumantPerigee.toFixed(4) + " ";
  //make the mean anomaly?
  const topPart = Math.cos(degreeToRadians(trueAnomaly)) + ecc;
  const bottomPart = 1 + ecc * Math.cos(degreeToRadians(trueAnomaly));
  const eccetricAnomaly = radianToDegree(Math.acos(topPart / bottomPart));
  let meanAnomaly = eccetricAnomaly - ecc * Math.sin(degreeToRadians(eccetricAnomaly));
  if (trueAnomaly < 0) meanAnomaly = 360 - meanAnomaly;
  console.log("mean anomaly - " + trueAnomaly);
  TLEsecondLine += meanAnomaly.toFixed(4) + " ";
  //make meanMotion
  let meanMotion =
    (86400 / (2 * Math.PI)) *
    Math.sqrt((gravitaionalConstentEarth) / Math.pow(semiMajorAxis, 3));
  TLEsecondLine += meanMotion.toString().slice(0, 11) + " ";
  return TLEsecondLine;
}

function convertCartesianToKepler() {
  ri = document.getElementById("Cart_1").innerHTML;
  rj = document.getElementById("Cart_2").innerHTML;
  rk = document.getElementById("Cart_3").innerHTML;
  vi = document.getElementById("Cart_4").innerHTML;
  vj = document.getElementById("Cart_5").innerHTML;
  vk = document.getElementById("Cart_6").innerHTML;
  // const Rvector = [6524.834, 6862.875, 6448.296];
  // const Vvector = [4.901327, 5.533756, -1.976341];
  const Rvector = [ri, rj, rk];
  const Vvector = [vi, vj, vk];
  const Hvector = vectoricalMultiple(Rvector, Vvector);
  const Nvector = vectoricalMultiple([0, 0, 1], Hvector);
  //inclination
  const inclination = radianToDegree(Math.acos((Hvector[2] / getMagnitudeOfMetrix(Hvector))));
  console.log("inclination - " + inclination);
  //semi major axis
  const tempValue = ((Math.pow(getMagnitudeOfMetrix(Vvector), 2) / 2) - (gravitaionalConstentEarth / getMagnitudeOfMetrix(Rvector)));
  const semiMajorAxis = ((-gravitaionalConstentEarth) / (2 * tempValue));
  console.log("semiMajorAxis - " + semiMajorAxis);
  //eccentricity
  const temp1 = multipleScalarAndVector(Rvector, (Math.pow(getMagnitudeOfMetrix(Vvector), 2) - (gravitaionalConstentEarth / getMagnitudeOfMetrix(Rvector))));
  const temp2 = multipleScalarAndVector(Vvector, scalaricMultiple(Rvector, Vvector));
  const Evector = multipleScalarAndVector(vectoricalSubtraction(temp1, temp2), (1 / gravitaionalConstentEarth));
  const eccentricity = getMagnitudeOfMetrix(Evector);
  console.log("eccentricity - " + eccentricity);
  //ascendingNode
  let ascendingNode = radianToDegree(Math.acos((Nvector[0] / getMagnitudeOfMetrix(Nvector))));
  if (Nvector[1] < 0) ascendingNode = 360 - ascendingNode;
  console.log("ascendingNode - " + ascendingNode);
  //argumantPerigee
  const temp3 = (scalaricMultiple(Nvector, Evector));
  const temp4 = getMagnitudeOfMetrix(Nvector) * getMagnitudeOfMetrix(Evector);
  let argumantPerigee = radianToDegree(Math.acos(temp3 / temp4));
  if (Evector[2] < 0) argumantPerigee = 360 - argumantPerigee;
  console.log("argumantPerigee - " + argumantPerigee);
  //trueAnomaly
  const temp5 = (scalaricMultiple(Evector, Rvector));
  const temp6 = getMagnitudeOfMetrix(Evector) * getMagnitudeOfMetrix(Rvector);
  let trueAnomaly = radianToDegree(Math.acos(temp5 / temp6));
  if (scalaricMultiple(Rvector, Vvector) < 0) trueAnomaly = 360 - trueAnomaly;
  if (trueAnomaly > 180) trueAnomaly = trueAnomaly - 360;
  console.log("trueAnomaly - " + trueAnomaly);

  document.getElementById("backParams").style.display = "block";
  const TLEsecondLine = convertKeplerToTLE(semiMajorAxis, inclination, ascendingNode, argumantPerigee, eccentricity, trueAnomaly);
  document.getElementById("backParams").innerHTML = TLEsecondLine;
  console.log(TLEsecondLine);
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
  gravity = gravitaionalConstentEarth;
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
  console.log(returnArray);
  if (returnArray) {
    insertKepler(returnArray[2]);
    document.getElementById("KeplerStat").style.display = "inline-block";
  }
}

function getTrueAnamoly(Eccentricity, meanAnomaly, dp) {
  i = 0;
  maxIter = 30;
  delta = Math.pow(10, -dp);
  meanAnomaly = meanAnomaly % 360;
  meanAnomaly = (meanAnomaly * 2.0 * Math.PI) / 360.0;
  eccentricAnomaly = Eccentricity < 0.8 ? meanAnomaly : Math.PI;
  F = eccentricAnomaly - Eccentricity * Math.sin(meanAnomaly) - meanAnomaly;
  while (Math.abs(F) > delta && i < maxIter) {
    eccentricAnomaly =
      eccentricAnomaly - F / (1.0 - Eccentricity * Math.cos(eccentricAnomaly));
    F =
      eccentricAnomaly -
      Eccentricity * Math.sin(eccentricAnomaly) -
      meanAnomaly;
    i = i + 1;
  }
  eccentricAnomalyDegree = ((eccentricAnomaly * 180.0) / Math.PI).toFixed(dp);
  sin = Math.sin(eccentricAnomaly);
  cos = Math.cos(eccentricAnomaly);
  fak = Math.sqrt(1.0 - Math.pow(Eccentricity, 2));
  phi = ((Math.atan2(fak * sin, cos - Eccentricity) * 180.0) / Math.PI).toFixed(
    4
  );
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
  (LocVector = []),
    (VelVector = []),
    (ConversionMetrix = []),
    (elementMatrix = []);
  //make variebles to radians
  trueAnomalyR = (trueAnomaly * Math.PI) / 180;
  omegaBig = (omegaBig * Math.PI) / 180;
  omegaSmall = (omegaSmall * Math.PI) / 180;
  iR = (i * Math.PI) / 180;
  //Location vector
  LocVector.push((a * Math.cos(trueAnomalyR)) / (1 + e * Math.cos(trueAnomalyR)));
  LocVector.push((a * Math.sin(trueAnomalyR)) / (1 + e * Math.cos(trueAnomalyR)));
  LocVector.push(0);
  console.log(LocVector);
  //velocety vector
  VelVector.push(-(Math.sqrt((gravitaionalConstentEarth) / a) * Math.sin(trueAnomalyR)));
  VelVector.push(Math.sqrt((gravitaionalConstentEarth) / a) * (e + Math.cos(trueAnomalyR)));
  VelVector.push(0);
  console.log(VelVector);
  //Convertion metrix
  elementMatrix.push(Math.cos(omegaBig) * Math.cos(omegaSmall) - Math.sin(omegaBig) * Math.sin(omegaSmall) * Math.cos(iR));
  elementMatrix.push(-(Math.cos(omegaBig) * Math.sin(omegaSmall)) - Math.sin(omegaBig) * Math.cos(omegaSmall) * Math.cos(iR));
  elementMatrix.push(Math.sin(omegaBig) * Math.sin(iR));
  ConversionMetrix.push(elementMatrix);
  elementMatrix = [];
  elementMatrix.push(
    Math.sin(omegaBig) * Math.cos(omegaSmall) +
    Math.cos(omegaBig) * Math.sin(omegaSmall) * Math.cos(iR)
  );
  elementMatrix.push(-(Math.sin(omegaBig) * Math.sin(omegaSmall)) + Math.cos(omegaBig) * Math.cos(omegaSmall) * Math.cos(iR));
  elementMatrix.push(-(Math.cos(omegaBig) * Math.sin(iR)));
  ConversionMetrix.push(elementMatrix);
  elementMatrix = [];
  elementMatrix.push(Math.sin(omegaSmall) * Math.sin(iR));
  elementMatrix.push(Math.cos(omegaSmall) * Math.sin(iR));
  elementMatrix.push(Math.cos(iR));
  ConversionMetrix.push(elementMatrix);
  console.log(ConversionMetrix);
  elementMatrix = [];
  console.log(ConversionMetrix);
  LocVector = multiplieMetrix(ConversionMetrix, LocVector);
  console.log("Final Location - " + LocVector);
  VelVector = multiplieMetrix(ConversionMetrix, VelVector);
  console.log("Final Velocity - " + VelVector);
  return [LocVector, VelVector];
}
function convertFuncCartesian() {
  resetAllBlocks();
  returnArray = getDATAandSplit();
  if (returnArray) {
    array = FindKeplerFromTLE(returnArray[2]);
    returnArray = showCartesianData(
      array[0],
      array[1],
      array[2],
      array[3],
      array[4],
      array[5]
    );
    insertCartesian(returnArray);
    document.getElementById("CartesianStat").style.display = "inline-block";
  }
}

/******************************************************************/
/******************************************************************/
/*                   MATHMETICAL MODULES                          */
/******************************************************************/
/******************************************************************/

function degreeToRadians(degree) {
  return degree / 57.2958;
}
function radianToDegree(radian) {
  return radian * 57.2958;
}
function getMagnitudeOfMetrix(mat) {
  return Math.sqrt((Math.pow(mat[0], 2) + Math.pow(mat[1], 2) + Math.pow(mat[2], 2)))
}
function vectoricalMultiple(mat1, mat2) {
  return [
    mat1[1] * mat2[2] - mat1[2] * mat2[1],
    mat1[2] * mat2[0] - mat1[0] * mat2[2],
    mat1[0] * mat2[1] - mat1[1] * mat2[0]
  ]
}
function multipleScalarAndVector(mat, scalar) {
  return [mat[0] * scalar, mat[1] * scalar, mat[2] * scalar];
}
function multiplieMetrix(mat1, mat2) {
  resultMatrix = [];
  for (i = 0; i < mat1.length; i++) {
    sum = 0;
    for (j = 0; j < mat2.length; j++) {
      sum += mat1[i][j] * mat2[j];
    }
    resultMatrix.push(sum.toFixed(8));
  }
  return resultMatrix;
}
function scalaricMultiple(mat1, mat2) {
  return (mat1[0] * mat2[0]) + (mat1[1] * mat2[1]) + (mat1[2] * mat2[2])
}
function vectoricalSubtraction(mat1, mat2) {
  return [mat1[0] - mat2[0], mat1[1] - mat2[1], mat1[2] - mat2[2]]
}

/******************************************************************/
/******************************************************************/
/*                        GENRAL MODULES                          */
/******************************************************************/
/******************************************************************/

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
