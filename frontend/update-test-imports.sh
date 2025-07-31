#!/bin/bash

# Update test files to use custom test-utils
FILES=(
  "src/tests/unit/components/ResponsiveTable.test.tsx"
  "src/tests/unit/components/MobileNavigation.test.tsx"
  "src/tests/unit/components/ErrorBoundary.test.tsx"
  "src/components/ResultsDisplayComponent.test.tsx"
  "src/tests/unit/components/loading/LoadingOverlay.test.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    # Replace the import statement
    sed -i "s|import { render, screen.*} from '@testing-library/react';|import { render, screen, fireEvent, waitFor } from '../../../../tests/utils/test-utils';|g" "$file"
    sed -i "s|import { render.*} from '@testing-library/react';|import { render, screen, fireEvent, waitFor } from '../../tests/utils/test-utils';|g" "$file"
    # Handle different path depths
    sed -i "s|import { render.*} from '@testing-library/react';|import { render, screen, fireEvent, waitFor } from '../tests/utils/test-utils';|g" "$file"
  fi
done

echo "Import updates complete!"