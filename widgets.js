/* http://docs.angularjs.org/#!angular.widget */
var appWidgets = angular.module('appWidgets', [])

appWidgets.directive('myDatepicker', function () {
    return {
        restrict:'A',
        require:'ngModel',
        link:function (scope, element, attrs, ngModel) {
            var minDateObject = new Date();
            if (attrs.minDate) {
                var day = moment(attrs.minDate, "MM-DD-YYYY");
                minDateObject = day.toDate();
            }
            element.datepicker({
                showOn:"both",
                changeYear:true,
                changeMonth:true,
                dateFormat:'mm/dd/yy',
                minDate:minDateObject,
                maxDate:new Date(2014, 11, 31),
                onSelect:function (dateText, inst) {
                    ngModel.$setViewValue(dateText);
                    scope.$apply();
                }
            })
            attrs.$observe('minDate', function (value) {
                if (!value) {
                    return;
                }
                // console.info("directive")
                minDateObject = moment(value, "MM-DD-YYYY").toDate();
                element.datepicker("option", "minDate", minDateObject);
            })
        }
    }
});

appWidgets.directive('attachments', function () {
    return {
        restrict:'A',
        require:'ngModel',
        templateUrl:'assets/attachments.html',

        link:function (scope, element, attrs, ngModel) {
            scope.uploader = new plupload.Uploader({
                runtimes:'html5,html4',
                url:scope.$eval(attrs.attachments),
                max_file_size:'10mb',
                container:'uploadContainer',
                drop_element:'dropArea',
                browse_button:'addFile',
                multiple_queues:true,
                filters:[
                    {title:"Image files", extensions:"jpg,gif,png"},
                    {title:"Pdf files", extensions:"pdf"},
                    {title:"Text files", extensions:"txt, rtf"}
                ],
                multipart:true,
                multipart_params:{
                    '_http_accept':'application/javascript',
                    'authenticity_token':$('meta[name=csrf-token]').attr('content')
                }
            });

            scope.uploader.init();

            scope.uploader.bind('FilesAdded', function (up, files) {
                scope.$apply();
            });

            scope.uploader.bind('FileUploaded', function (up, file, response) {
                jresp = JSON.parse(response.response);
                ngModel.$setViewValue(jresp._attachments);
                scope.uploader.removeFile(file);
                $('#loading').hide();
                scope.$apply();
            })

            scope.uploader.bind('Error', function (up, error) {
                console.info(error)
                $('#loading').hide();
                scope.$apply();
            });

            scope.upload = function (url) {
                if (url) {
                    scope.uploader.settings.url = url;
                }
                $('#loading').show();
                scope.uploader.start();
            }
        }
    }
});

appWidgets.directive('raty', function () {
    return {
        restrict:'A',
        require:'ngModel',
        link:function (scope, element, attrs, ngModel) {
            var config = {};
            config.click = function (score, evt) {
                ngModel.$setViewValue(score);
                scope.$apply();
            };
            attrs.$observe('score', function (value) {
                config.score = parseInt(attrs.score);
                config.readOnly = attrs.locked == "true";
                $(element).raty(config);
            })
            $(element).raty(config);
        }
    }
});