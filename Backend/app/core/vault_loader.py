import os
import json
from app.utils.logging import logger


def load_config() -> None:
    """
    Load configuration from Vault injected JSON file.
    
    Vault Agent automatically injects secrets as JSON files at:
    /vault/secrets/configuration.{PYTHON_ENVIRONMENT}.json
    
    For local development without Vault, gracefully skip if file doesn't exist.
    """
    print("🔐 Loading configuration from Vault...")
    service_env = os.getenv('PYTHON_ENVIRONMENT', 'development').lower()
    vault_config_path = f'/vault/secrets/configuration.{service_env}.json'
    
    logger.info(f"Loading configuration from Vault file: {vault_config_path}")
    _load_from_vault_file(vault_config_path)


def _load_from_vault_file(vault_config_path: str) -> None:
    """
    Load secrets from Vault injected JSON file and set environment variables.
    
    Args:
        vault_config_path: Path to the Vault configuration JSON file
    """
    if not os.path.exists(vault_config_path):
        logger.warning(f"⚠ Vault configuration file not found: {vault_config_path}")
        print("⚠ Vault configuration file not found, skipping loading from Vault.")
        logger.info("💡 For local development, ensure .env file exists in project root")
        logger.info("💡 For Docker deployment, ensure Vault Agent injects configuration")
        return
    
    try:
        with open(vault_config_path, 'r') as config_file:
            config_data = json.load(config_file)
            print("✓ Successfully read Vault configuration file.")
        
        if not isinstance(config_data, dict):
            logger.error("✗ Vault configuration is not a dictionary")
            return
        
        # Log all config keys (without values for security)
        secret_keys = list(config_data.keys())
        logger.info(f"✓ Loaded {len(secret_keys)} configuration keys from Vault")
        
        # Set environment variables from config
        for key, value in config_data.items():
            os.environ[key] = str(value)
            logger.debug(f"Set environment variable: {key}")
            print(f"✓ Set environment variable: {key}: {value}")
        
        logger.info(f"✓ Successfully loaded configuration from Vault ({vault_config_path})")
    
    except json.JSONDecodeError as e:
        logger.error(f"✗ Failed to parse Vault configuration JSON: {str(e)}")
    except Exception as e:
        logger.error(f"✗ Failed to load configuration from Vault: {str(e)}")