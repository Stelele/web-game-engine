export class InputHandler {
    private static _keys: Record<string, boolean> = {}

    public static get keys(): Record<string, boolean> {
        return this._keys
    }

    private static set keys(_e) { }

    public static initialize() {
        window.addEventListener('keydown', (e) => {
            this._keys[e.key] = true
        })

        window.addEventListener('keyup', (e) => {
            this._keys[e.key] = false
        })
    }
}