/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { CoreSetup, CoreStart, Plugin } from '@kbn/core/server';
import { ExpressionsServerStart, ExpressionsServerSetup } from '@kbn/expressions-plugin/server';
import { shapeFunction, progressFunction } from '../common/expression_functions';

interface SetupDeps {
  expressions: ExpressionsServerSetup;
}

interface StartDeps {
  expression: ExpressionsServerStart;
}

export type ExpressionShapePluginSetup = void;
export type ExpressionShapePluginStart = void;

export class ExpressionShapePlugin
  implements Plugin<ExpressionShapePluginSetup, ExpressionShapePluginStart, SetupDeps, StartDeps>
{
  public setup(core: CoreSetup, { expressions }: SetupDeps): ExpressionShapePluginSetup {
    expressions.registerFunction(shapeFunction);
    expressions.registerFunction(progressFunction);
  }

  public start(core: CoreStart): ExpressionShapePluginStart {}

  public stop() {}
}
