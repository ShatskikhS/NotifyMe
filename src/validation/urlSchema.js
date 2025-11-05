import Joi from 'joi';
import fs from 'node:fs';
import path from 'node:path';

const urlSchema = Joi.string().uri({
    allowRelative: true,
    
});

export default urlSchema;