/**
 * Created by jiengfei on 15-4-13.
 */
var Group = require('./Group');
var wvv = require('./wvv');
var tween = require('./tween');
var ImageDrawable = require('./ImageDrawable');
var Stage = require('./Stage');
var DrawRecorder = require('./DrawRecorder');
var Element = require('./Element');

function init() {
    var gdr = new DrawRecorder().beginPath().rect(0, 0, 50, 50).stroke().drawable(50, 50);
    var imgDr = new ImageDrawable(120, 120, 'res/img/eggHead.png');
    imgDr.onLoad = function(success) {
        console.log("onLoad success="+success);
    };
    var shape1 = new Element(gdr);
    var shape2 = new Element(gdr);
    var shape3 = new Element(imgDr);
    //utils.print(shape1);
    shape1.scale(0.5, 0.5);
    shape2.setTranslate(0, 50);
    shape3.rotate(45);
    shape3.scale(2, 2);
    shape3.move(50, 100);
    //
    var group = (new Group()).add(shape1).skipH(100).add(shape2).nextLine()
        .skipV(100).add(shape3);
    //var group = (new Group()).skipH(100).skipV(100).add(shape3);
    var stage = new Stage();
    wvv.setStage("demoCanvas", stage);
    stage.addGroup(group);
    wvv.gameLoop();
    //convert to radian
    tween.get(shape2).to({"r": 45}).ease(function (x) {
        return x;
    }).duration(1000).start();
    tween.get(shape3).to({"r": 360}).ease(function (x) {
        return x;
    }).duration(1000).start();
    tween.get(shape1).to({'tx': 400, 'ty': 200, "sx": 5, 'r':90}).ease(function (x) {
        return x;
    }).duration(1000).start();

    //
    //var img = new Image();   // Create new img element
    //img.addEventListener("load", function() {
    //    console.log("image loaded 0");
    //}, false);
    //img.onload = function() {
    //  console.log("image onload 1");
    //};
    //img.onload = function() {
    //    console.log("image onload 2");
    //};
    //img.src = 'res/img/backdrop.png'; // Set source path
};

init();