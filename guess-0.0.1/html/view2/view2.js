'use strict';

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl',
            controllerAs: '$ctrl',
        });
}])

    .controller('View2Ctrl', [function () {

        RobotUtils.onService(function (ALVideoDevice, ALListeningMovement) {
            ALListeningMovement.setEnabled(false)
            try {
                VideoUtils.unsubscribeAllHandlers(ALVideoDevice, 'video_buffer_camera').then(function () {
                    VideoUtils.startVideo(ALVideoDevice, 'video_buffer', 0, 10, 13);

                    $scope.ready = true;
                    $scope.$apply();
                });
            } catch (e) {
                VideoUtils.startVideo(ALVideoDevice, 'login_video_buffer', 0, 10, 0);
            }
        });
        this.stop = function () {
            console.log('stopping')
            RobotUtils.onService(function (ALBehaviorManager) {
                ALBehaviorManager.stopBehavior("guess_age/emotion");
            });
        };
        this.end = function () {
            console.log('end');
            this.stop();
            RobotUtils.onService(function (ALMemory) {
                ALMemory.raiseEvent("Guess/End", 1);
            });

        };

}]);
