import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "../ThemedText";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  maxVisiblePages?: number;
  style?: any;
}

interface PaginationButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  theme: any;
  variant?: 'default' | 'icon' | 'text';
}

const PaginationButton: React.FC<PaginationButtonProps> = ({
  children,
  onPress,
  disabled = false,
  active = false,
  theme,
  variant = 'default'
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.paginationButton];
    
    if (variant === 'icon') {
      baseStyle.push(styles.iconButton);
    } else if (variant === 'text') {
      baseStyle.push(styles.textButton);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledButton);
      baseStyle.push({ backgroundColor: theme.border });
    } else if (active) {
      baseStyle.push(styles.activeButton);
      baseStyle.push({ backgroundColor: theme.orange });
    } else {
      baseStyle.push(styles.defaultButton);
      baseStyle.push({ 
        backgroundColor: theme.background, 
        borderColor: theme.border 
      });
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    if (disabled) {
      return [styles.buttonText, { color: theme.tabIconDefault }];
    } else if (active) {
      return [styles.buttonText, styles.activeButtonText];
    } else {
      return [styles.buttonText, { color: theme.text }];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {typeof children === 'string' ? (
        <ThemedText style={getTextStyle()}>{children}</ThemedText>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  maxVisiblePages = 5,
  style
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we don't have enough pages at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <View style={[styles.paginationContainer, style]}>
      {/* Pagination Info */}
      {showInfo && (
        <View style={styles.paginationInfo}>
          <ThemedText style={[styles.infoText, { color: theme.text }]}>
            Showing {startItem}-{endItem} of {totalItems} results
          </ThemedText>
          <View style={styles.pageInfo}>
            <ThemedText style={[styles.infoText, { color: theme.text }]}>
              Page {currentPage} of {totalPages}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Pagination Controls */}
      <View style={styles.paginationControls}>
        {/* First Page Button */}
        <PaginationButton
          onPress={() => handlePageChange(1)}
          disabled={currentPage === 1}
          theme={theme}
          variant="icon"
        >
          <Feather 
            name="chevrons-left" 
            size={16} 
            color={currentPage === 1 ? theme.tabIconDefault : theme.text} 
          />
        </PaginationButton>

        {/* Previous Page Button */}
        <PaginationButton
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          theme={theme}
          variant="icon"
        >
          <Feather 
            name="chevron-left" 
            size={16} 
            color={currentPage === 1 ? theme.tabIconDefault : theme.text} 
          />
        </PaginationButton>

        {/* Page Numbers */}
        <View style={styles.pageNumbers}>
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <View key={`ellipsis-${index}`} style={styles.ellipsis}>
                  <ThemedText style={{ color: theme.text }}>...</ThemedText>
                </View>
              );
            }

            return (
              <PaginationButton
                key={page}
                onPress={() => handlePageChange(page as number)}
                active={page === currentPage}
                theme={theme}
              >
                {page.toString()}
              </PaginationButton>
            );
          })}
        </View>

        {/* Next Page Button */}
        <PaginationButton
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          theme={theme}
          variant="icon"
        >
          <Feather 
            name="chevron-right" 
            size={16} 
            color={currentPage === totalPages ? theme.tabIconDefault : theme.text} 
          />
        </PaginationButton>

        {/* Last Page Button */}
        <PaginationButton
          onPress={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          theme={theme}
          variant="icon"
        >
          <Feather 
            name="chevrons-right" 
            size={16} 
            color={currentPage === totalPages ? theme.tabIconDefault : theme.text} 
          />
        </PaginationButton>
      </View>

      {/* Quick Jump (for larger datasets) */}
      {totalPages > 10 && (
        <View style={styles.quickJump}>
          <TouchableOpacity
            style={[styles.jumpButton, { borderColor: theme.border }]}
            onPress={() => handlePageChange(Math.max(1, currentPage - 5))}
          >
            <ThemedText style={[styles.jumpText, { color: theme.text }]}>
              -5
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.jumpButton, { borderColor: theme.border }]}
            onPress={() => handlePageChange(Math.min(totalPages, currentPage + 5))}
          >
            <ThemedText style={[styles.jumpText, { color: theme.text }]}>
              +5
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Hook for pagination logic
export const usePagination = (items: any[], itemsPerPage: number = 12) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    // You can add scroll logic here if needed
  };

  // Reset to first page when items change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  return {
    currentPage,
    totalPages,
    currentItems,
    handlePageChange,
    totalItems: items.length,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

const styles = StyleSheet.create({
  paginationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  pageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 8,
  },
  paginationButton: {
    minWidth: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconButton: {
    minWidth: 36,
    height: 36,
  },
  textButton: {
    paddingHorizontal: 8,
  },
  defaultButton: {
    borderWidth: 1,
  },
  activeButton: {
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeButtonText: {
    color: 'white',
  },
  ellipsis: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickJump: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  jumpButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  jumpText: {
    fontSize: 12,
    fontWeight: '500',
  },
});