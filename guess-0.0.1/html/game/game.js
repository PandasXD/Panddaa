'use strict';

angular.module('myApp.game', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/game', {
            templateUrl: 'game/game.html',
            controller: 'GameCtrl',
            controllerAs: '$ctrl',
        });
}])

    .controller('GameCtrl', [ function () {
        this.start_age=function(){
            console.log('start_age');
            RobotUtils.onService(function (ALBehaviorManager) {
                ALBehaviorManager.startBehavior("guess_age/gage");
            });
        };
        this.start_emo=function(){
            console.log('start_emo');
            RobotUtils.onService(function (ALBehaviorManager) {
                ALBehaviorManager.startBehavior("guess_age/emotion");
            });
        };
        this.end=function(){
            console.log('end');
            RobotUtils.onService(function(ALMemory){
            ALMemory.raiseEvent("Guess/End", 1);
        });
            
        };
        
}]);
