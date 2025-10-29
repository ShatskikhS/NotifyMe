# Configuration System (NotifyMe)

This module defines how NotifyMe loads and validates its runtime configuration.
It combines three potential sources of settings and produces a single `config`
object used by the entire application.

---

## Overview

Configuration values can come from:

1. **Command-line parameters** (`cliParams.js`) — parsed using [Commander](https://www.npmjs.com/package/commander).
2. **Environment variables / `.env` file** — loaded via [dotenv](https://www.npmjs.com/package/dotenv) and validated with [Joi](https://www.npmjs.com/package/joi).
3. **Default values** — applied only where explicitly allowed (e.g., `debug: false`).

The final configuration is constructed in `config.js` and exported as a singleton.

---

## Priority Rules

| Source | Priority | Notes |
|--------|-----------|-------|
| CLI parameters | Highest | Always override environment values |
| Environment variables | Medium | Validated through Joi schema |
| Defaults | Lowest | Used only when explicitly defined in code |

For example, if both `--port` and `PORT` are defined, the CLI value is used.

---

## Validation

All environment variables are validated by `validation/env.js` before being merged.
- `PORT`: must be an integer between **0** and **65535**.  
  - Empty or undefined → treated as `undefined` (no error).  
  - Invalid values → throw `EnvironmentValueError`.
- `DEBUG`: interpreted as boolean. Empty string means `false`.

Unknown variables are ignored (`.unknown()` in Joi schema).

---

## Error Handling

- Missing or invalid critical values (e.g., no port defined anywhere) raise
  an `EnvironmentValueError` and stop application startup.
- Validation errors are reported immediately to make misconfiguration visible.

---

## Example Flow

dotenv.config()  
↓  
validate(process.env) → { PORT, DEBUG }  
↓  
merge(cliParams, envValues)  
↓  
export default config


---

## Design Notes

- CLI parameters always take precedence to simplify testing and quick overrides.
- Empty values in `.env` are not considered defaults — they signal misconfiguration.
- The configuration is loaded once and cached through Node’s module system.
