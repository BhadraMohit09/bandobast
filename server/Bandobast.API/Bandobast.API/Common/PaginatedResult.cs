namespace Bandobast.API.Common;

public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
    
    public PaginatedResult() {}

    public PaginatedResult(List<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        CurrentPage = page;
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
    }
}
