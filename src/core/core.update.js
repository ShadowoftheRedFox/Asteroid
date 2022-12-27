/// <reference path="../../ts/type.d.ts"/>

/**
 * 
 * @param {GameScope} scope 
 * @returns {Function}
 */
function GameStateUpdate(scope) {
    return function update(tFrame) {
        var menus = scope.state.menu;
        //Loop through menu
        for (var menu in menus) {
            // Fire off each active menus `update` method
            const m = menus[menu];
            if (m.activated === true) {
                m.update(scope);
            }
        }

        var entities = scope.state.entity;
        //Loop through menu
        for (var entity in entities) {
            // Fire off each active entities `update` method
            if (entities[entity]) {
                entities[entity].update(scope);
            }
        }

        return scope.state;
    };
}