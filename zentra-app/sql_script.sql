CREATE TABLE users (
    user_id INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(15),
    status ENUM('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    role_id INT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE permission (
    permission_id INT PRIMARY KEY,
    permission_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

CREATE TABLE role_permissions (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE
);

CREATE TABLE user_settings (
    user_id INT PRIMARY KEY,
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'pt-BR',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE categoria(
    categoria_id INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);
CREATE TABLE marca(
    marca_id INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE produto(
    produto_id INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria_id INT,
    marca_id INT,
    preco DECIMAL(10, 2) NOT NULL,
    prescricao_necessaria BOOLEAN, 
    idade_minima BOOLEAN,
    status ENUM('disponivel', 'indisponivel', 'descontinuado') DEFAULT 'disponivel',
    FOREIGN KEY (categoria_id) REFERENCES categoria(categoria_id) ON DELETE SET NULL,
    FOREIGN KEY (marca_id) REFERENCES marca(marca_id) ON DELETE SET NULL
);


CREATE TABLE fornecedor(
    fornecedor_id INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    contato VARCHAR(100),
    telefone VARCHAR(15),
    email VARCHAR(100) UNIQUE
);



 