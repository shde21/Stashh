CREATE TABLE platform_metadata (
    id BIGINT PRIMARY KEY,
    product_name VARCHAR(120) NOT NULL,
    schema_version VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT platform_metadata_singleton CHECK (id = 1)
);

INSERT INTO platform_metadata (id, product_name, schema_version)
VALUES (1, 'Startup Investment Platform', '1');
