/**
 * Created by jiengfei on 15-4-13.
 */
var Group = require('./Group');
var wvv = require('./wvv');
var tween = require('./tween');
function init() {
    var Stage = require('./Stage');
    var DrawRecorder = require('./DrawRecorder');

    var Element = require('./Element');
    var gdr = new DrawRecorder().beginPath().rect(0, 0, 50, 50).stroke().drawable(50, 50);
    //
    var shape1 = new Element(gdr);
    var shape2 = new Element(gdr);
    var shape3 = new Element(gdr);
    //utils.print(shape1);
    //shape1.scale(0.5, 0.5);
    //shape2.setTranslate(0, 50);
    //shape3.rotate(120);

    var group = (new Group()).add(shape1).skipH(100).add(shape2).nextLine()
        .skipV(100).add(shape3);

    var stage = new Stage();
    wvv.setStage("demoCanvas", stage);
    stage.addGroup(group);
    wvv.gameLoop();
    //convert to radian
    tween.get(shape1).to({"r": 180 * Math.PI / 180}).ease(function (x) {
        return x;
    }).duration(10000).start();
    //tween.get(shape1).to({'tx': 400, 'ty': 200, "sx": 5}).ease(function (x) {
    //    return x;
    //}).duration(1000).start();
};

init();