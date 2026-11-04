def insertion_sort(arr):
    """
    Sorts an array in-place using Insertion Sort.
    Returns: (comparisons_count, shifts_count)
    """
    comparisons = 0
    shifts = 0
    
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        
        while j >= 0:
            comparisons += 1
            if arr[j] > key:
                arr[j + 1] = arr[j]
                shifts += 1
                j -= 1
            else:
                break
                
        arr[j + 1] = key
        shifts += 1  
        
    return comparisons, shifts

# --- Unit Tests ---
if __name__ == '__main__':
    # Test 1: Random Array
    arr1 = [4, 3, 2, 10, 12, 1, 5, 6]
    comp1, shifts1 = insertion_sort(arr1)
    assert arr1 == [1, 2, 3, 4, 5, 6, 10, 12], "Test 1 Failed"
    
    # Test 2: Already Sorted Array (Best Case)
    arr2 = [1, 2, 3, 4, 5]
    comp2, shifts2 = insertion_sort(arr2)
    assert arr2 == [1, 2, 3, 4, 5], "Test 2 Failed"
    
    # Test 3: Reverse Sorted Array (Worst Case)
    arr3 = [5, 4, 3, 2, 1]
    comp3, shifts3 = insertion_sort(arr3)
    assert arr3 == [1, 2, 3, 4, 5], "Test 3 Failed"
    
    print("All unit tests passed successfully!")