from flask import Flask
from flask_cors import CORS

from routes.auth import auth_bp
from routes.productos import productos_bp
from routes.categorias import categorias_bp
from routes.movimientos import movimientos_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

app.register_blueprint(
    productos_bp,
    url_prefix="/api/productos"
)

app.register_blueprint(
    categorias_bp,
    url_prefix="/api/categorias"
)

app.register_blueprint(
    movimientos_bp,
    url_prefix="/api/movimientos"
)


@app.route("/")
def inicio():
    return {
        "mensaje": "Bienvenido a la API de NovaStock"
    }


if __name__ == "__main__":
    app.run(debug=True)