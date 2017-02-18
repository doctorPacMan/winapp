(function () {
    "use strict";

    console.log('initialize');

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: это приложение только что запущено. Инициализируйте здесь свое приложение.
                console.log('APP Initialize', myApp.load());
            } else {
                // TODO: работа этого приложения была приостановлена и затем завершена.
                // Для удобства пользователей восстановите здесь состояние приложения, как будто приложение никогда не прекращало работу.
                console.log('APP Restore', myApp.load());
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };
    app.oncheckpoint = function (args) {
        // TODO: действие приложения будет приостановлено. Сохраните здесь все состояния, которые понадобятся после приостановки.
        // Вы можете использовать объект WinJS.Application.sessionState, который автоматически сохраняется и восстанавливается после приостановки.
        // Если вам нужно завершить асинхронную операцию до того, как действие приложения будет приостановлено, вызовите args.setPromise().
    };

    app.start();
})();
