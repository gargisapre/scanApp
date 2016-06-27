'use strict';

app.home = kendo.observable({
    onShow: function () {},
    afterShow: function () {}
});

// START_CUSTOM_CODE_home
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_home


// START_CUSTOM_CODE_homeModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

(function (parent) {
    var redirect = signinRedirect,
        model = parent.homeModel || {},
        logout = model.logout;
    var provider = app.data.scanApp,

        signinRedirect = 'scanPage',
        rememberKey = 'scanApp_authData_homeModel',
        init = function (error) {
            if (error) {
                if (error.message) {
                    alert(error.message);
                }
                return false;
            }

            var activeView = '.signin-view',
                model = parent.homeModel;
            //
            if (provider.setup && provider.setup.offlineStorage && !app.isOnline()) {
                $('.offline').show().siblings().hide();
            } else {
                $(activeView).show().siblings().hide();
            }

            if (model && model.set) {
                model.set('logout', null);
            }

            var rememberedData = localStorage ? JSON.parse(localStorage.getItem(rememberKey)) : app[rememberKey];
            if (rememberedData && rememberedData.email && rememberedData.password) {

                parent.homeModel.set('email', rememberedData.email);
                parent.homeModel.set('password', rememberedData.password);
                parent.homeModel.signin();
            }
        },
        successHandler = function (data) {

            if (logout) {
                model.set('logout', null);
            }
            if (data && data.result) {
                if (logout) {
                    provider.Users.logout(init, init);
                    return;
                }
                var rememberedData = {
                    email: model.email,
                    password: model.password
                };
                if (model.rememberme && rememberedData.email && rememberedData.password) {
                    if (localStorage) {
                        localStorage.setItem(rememberKey, JSON.stringify(rememberedData));
                    } else {
                        app[rememberKey] = rememberedData;
                    }
                }
                app.user = data.result;

                setTimeout(function () {
                    app.mobileApp.navigate('components/scanPage/view.html');
                }, 0);
            } else {
                init();
            }
        }, //i don't think i use anything up to this point...you can use the remembered data if you want 
        //but i didn't

        homeModel = kendo.observable({
            displayName: '', //json properties for object
            userName: '',
            email: '',
            password: '',
            validateData: function (data) { //validate data is a function that is a property for homeModel
                if (!data.userName) {
                    alert('Missing userName');
                    return false;
                }
                if (!data.email) {
                    alert('Missing email');
                    return false;
                } //gives you missing email alert if form is missing email

                if (!data.password) {
                    alert('Missing password');
                    return false;
                } //gives you missing password alert if form is missing password
                return true;
            },
            signin: function () {
                var aData = false;
                var model = homeModel,
                    username = model.userName,
                    email = model.email.toLowerCase(),
                    password = model.password;
                if (!model.validateData(model)) {
                    return false;
                } //this actually calls the validate data function
                $(document).ready(function () {
                    $.post("http://ec2-52-91-213-205.compute-1.amazonaws.com/echo/",
                        JSON.stringify({
                            userName: model.userName,
                            email: model.email,
                            password: model.password
                        }),
                        function (data, status, xhr) {
                            //this posts a request to the server and returns what you give the server
                            if (data.access === "granted") {
                                app.mobileApp.navigate('components/scanPage/view.html'); //this navigates to the scanner page using your path
                            }
                        }, "json");
                });
                // provider.Users.login(email, password, successHandler, init);
            }
        });
    window.myData = {
        username : homeModel.userName
    };
    parent.set('homeModel', homeModel);
    parent.set('afterShow', function (e) {
        if (e && e.view && e.view.params && e.view.params.logout) {
            if (localStorage) {
                localStorage.setItem(rememberKey, null);
            } else {
                app[rememberKey] = null;
            }
            homeModel.set('logout', true);
        }

        // app.mobileApp.navigate('components/scanPage' + redirect + '/view.html');
        // provider.Users.currentUser().then(successHandler, init);

    });
})(app.home);

// END_CUSTOM_CODE_homeModel