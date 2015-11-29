var sidePickerModal = angular.module('SidePickerModal', ['ui.bootstrap']);

sidePickerModal.directive('sidePickerModal', function() {
    return {
        // controller is set by the modal.open function, so not needed here
        restrict: 'AE',
        template: `
            <div class="side-picker-modal">
                <team-tile 
                    team="SidePickerModalCtrl.winningTeam">
                </team-tile>
            </div>
        `
    };
});

sidePickerModal.controller('SidePickerModalCtrl', function(winningTeam) {
    this.winningTeam = winningTeam;
});
